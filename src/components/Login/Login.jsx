import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { RiLockPasswordLine } from "react-icons/ri";
import { FaUser } from "react-icons/fa";
import { useFormik } from "formik";
import AbugidaLogo from "../AbugidaLogo";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useLoginMutation } from "../../redux/api/authApiSlice";
import { selectUser, setUserCredentials } from "../../redux/slice/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { navigateBasedOnRole } from "./NavigationUtills";
import AuthLayout from "../shared/auth/AuthLayout";
import FormField from "../shared/auth/FormField";
import PasswordField from "../shared/auth/PasswordField";
import SubmitButton from "../shared/auth/SubmitButton";

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [login, { isLoading }] = useLoginMutation();
  const currentUser = useSelector(selectUser);
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentUser) {
      navigateBasedOnRole(currentUser.role, navigate);
    }
  }, [currentUser, navigate]);

  const validationSchema = Yup.object({
    phone: Yup.string().required("Phone number is required"),
    password: Yup.string().required("Password is required"),
  });

  const formik = useFormik({
    initialValues: { phone: "", password: "" },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const { phone, password } = values;
        const result = await login({ phone_number: phone, password }).unwrap();
        dispatch(setUserCredentials({ token: result.token, user: result.user }));
        toast.success("Login successful!");
        navigateBasedOnRole(result.user.role, navigate);
      } catch (error) {
        toast.error(error.data?.message || "Login failed");
      }
    },
  });

  return (
    <AuthLayout>
      <div className="flex w-full max-w-5xl mx-4 min-h-[600px] rounded-2xl shadow-xl overflow-hidden bg-white">
        {/* Left - Brand Panel */}
        <div className="hidden lg:flex lg:w-5/12 bg-brand-navy p-10 flex-col justify-between relative overflow-hidden">

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <AbugidaLogo size={40} variant="icon" />
              <div>
                <h1 className="text-white text-xl font-bold tracking-tight">Abugida</h1>
                <p className="text-brand-sky text-xs">Tutor Platform</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white leading-tight">
                {t("welcomeBack")}
              </h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Manage tutor requests, approve applications, and match the right tutors with students.
              </p>
            </div>
          </div>

          <div className="relative z-10">
            <div className="border-t border-white/10 pt-6">
              <p className="text-white/50 text-xs">{t("newHere")}</p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/signup")}
                className="mt-2 px-5 py-2 border border-brand-gold text-brand-gold rounded-lg hover:bg-brand-gold/10 transition-colors text-sm font-medium"
              >
                {t("createAnAccount")}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Right - Form Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full lg:w-7/12 p-8 md:p-12 flex flex-col justify-center"
        >
          <div className="max-w-sm mx-auto w-full">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <AbugidaLogo size={36} />
              <span className="text-brand-navy font-bold text-lg">Abugida</span>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-brand-navy">{t("loginToYourAccount")}</h2>
              <p className="text-text-sub text-sm mt-1">{t("enterYourDetails")}</p>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-5">
              <FormField
                label={t("phoneNumber")}
                icon={FaUser}
                type="tel"
                placeholder={t("enterPhoneNumber")}
                fieldProps={formik.getFieldProps("phone")}
                error={formik.errors.phone}
                touched={formik.touched.phone}
              />

              <PasswordField
                label={t("password")}
                icon={RiLockPasswordLine}
                placeholder={t("enterYourPassword")}
                fieldProps={formik.getFieldProps("password")}
                error={formik.errors.password}
                touched={formik.touched.password}
              />

              <div className="flex items-center justify-between">
                <span className="text-sm text-text-sub">{t("forgotPassword")}</span>
              </div>

              <SubmitButton isLoading={isLoading} loadingText={t("signingIn")}>
                {t("signIn")}
              </SubmitButton>
            </form>

            {/* Mobile signup link */}
            <div className="mt-6 text-center lg:hidden">
              <p className="text-sm text-text-sub">
                {t("notRegistered")}{" "}
                <button onClick={() => navigate("/signup")} className="text-brand-sky font-medium hover:underline">
                  {t("signUp")}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AuthLayout>
  );
};

export default Login;
