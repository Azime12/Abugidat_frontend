const crypto = require('crypto');

class SriRuntimePlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap('SriRuntimePlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'SriRuntimePlugin',
          // Run during optimization, BEFORE Next.js's built-in SRI plugin
          stage: compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
        },
        (assets) => {
          // 1. Compute SHA-384 hashes for all JS/CSS/font chunks
          const sriMap = {};
          for (const [filename, source] of Object.entries(assets)) {
            if (
              (filename.startsWith('static/chunks/') && filename.endsWith('.js')) ||
              (filename.startsWith('static/css/') && filename.endsWith('.css')) ||
              (filename.startsWith('static/media/') && filename.endsWith('.woff2'))
            ) {
              const content = source.source();
              const buf = typeof content === 'string' ? Buffer.from(content) : content;
              const hash = crypto.createHash('sha384').update(buf).digest('base64');
              sriMap[filename] = 'sha384-' + hash;
            }
          }

          // 2. Find the webpack runtime chunk
          const runtimeFilename = Object.keys(assets).find(
            (f) => f.startsWith('static/chunks/webpack-') && f.endsWith('.js')
          );
          if (!runtimeFilename) {
            console.warn('[SriRuntimePlugin] No webpack runtime chunk found');
            return;
          }

          const sriMapJson = JSON.stringify(sriMap);

          // 3. Generate patch code: intercept HTMLScriptElement.prototype.src
          //    to add integrity for any script with data-webpack attribute (lazy chunks)
          const patchCode = [
            '(function(){',
            'var __sriMap__=' + sriMapJson + ';',
            'var __srcDesc=Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype,"src");',
            'var __srcSet=__srcDesc.set;',
            'Object.defineProperty(HTMLScriptElement.prototype,"src",{',
            'get:function(){return __srcDesc.get.call(this);},',
            'set:function(v){',
            'if(this.getAttribute("data-webpack")!==null&&v){',
            'var strV=String(v);',
            'var key=strV.replace(/.*\\/_next\\//,"");',
            'var integ=__sriMap__[key];',
            'if(integ){this.integrity=integ;this.crossOrigin="anonymous";}',
            '}',
            '__srcSet.call(this,v);',
            '}',
            '});',
            '})();',
          ].join('');

          // 4. Append patch code to the runtime chunk
          //    (runs after the webpack IIFE completes)
          const runtimeSource = assets[runtimeFilename].source().toString();
          assets[runtimeFilename] = new compiler.webpack.sources.RawSource(
            runtimeSource + '\n' + patchCode
          );

          console.log(
            '[SriRuntimePlugin] Patched webpack runtime with SRI map (' +
              Object.keys(sriMap).length +
              ' entries)'
          );
        }
      );
    });
  }
}

module.exports = SriRuntimePlugin;
