import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaUser, FaLock, FaPhone } from "react-icons/fa";
import { motion } from "framer-motion";
import AbugidaLogo from "../AbugidaLogo";
import { useSignupMutation } from "../../redux/api/authApiSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { selectUser } from "../../redux/slice/authSlice";
import { useSelector } from "react-redux";
import { navigateBasedOnRole } from "./NavigationUtills";
import AuthLayout from "../shared/auth/AuthLayout";
import FormField from "../shared/auth/FormField";
import PasswordField from "../shared/auth/PasswordField";
import SubmitButton from "../shared/auth/SubmitButton";

const SmartSignUp = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [signup, { isLoading }] = useSignupMutation();
  const currentUser = useSelector(selectUser);

  useEffect(() => {
    if (currentUser) {
      navigateBasedOnRole(currentUser?.role, navigate);
    }
  }, [currentUser, navigate]);

  const validationSchema = Yup.object({
    firstName: Yup.string().required(t("firstNameRequired")),
    lastName: Yup.string().required(t("lastNameRequired")),
    phone: Yup.string()
      .matches(/^0\d{9}$/, t("phoneValidation"))
      .required(t("phoneRequired")),
    password: Yup.string()
      .min(8, t("passwordMinLength"))
      .matches(/[a-z]/, t("passwordLowercase"))
      .matches(/[A-Z]/, t("passwordUppercase"))
      .matches(/[0-9]/, t("passwordNumber"))
      .matches(/[!@#$%^&*(),.?":{}|<>]/, t("passwordSpecialChar"))
      .required(t("passwordRequired")),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], t("passwordMatch"))
      .required(t("confirmPasswordRequired")),
  });

  const formik = useFormik({
    initialValues: { firstName: "", lastName: "", phone: "", password: "", confirmPassword: "" },
    validationSchema,
    onSubmit: async (values) => {
      const { firstName, lastName, phone, password } = values;
      const payload = { first_name: firstName, last_name: lastName, phone_number: phone, password };
      try {
        await signup(payload).unwrap();
        toast.success(t("registrationSuccessful") || "Account created successfully");
        navigate("/login");
      } catch (error) {
        toast.error(error.data?.message || t("registrationFailedGeneric") || "Registration failed");
      }
    },
  });

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden relative"
      >
        {/* Header with brand accent */}
        <div className="bg-brand-navy px-8 py-6 relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <AbugidaLogo size={40} variant="icon" />
            <div>
              <h1 className="text-xl font-bold text-white">Abugida</h1>
              <p className="text-brand-sky text-xs">{t("createAnAccount")}</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label={t("firstName")}
                icon={FaUser}
                placeholder={t("enterYourFirstName")}
                fieldProps={formik.getFieldProps("firstName")}
                error={formik.errors.firstName}
                touched={formik.touched.firstName}
              />

              <FormField
                label={t("lastName")}
                icon={FaUser}
                placeholder={t("enterYourLastName")}
                fieldProps={formik.getFieldProps("lastName")}
                error={formik.errors.lastName}
                touched={formik.touched.lastName}
              />
            </div>

            <FormField
              label={t("phoneNumber")}
              icon={FaPhone}
              type="tel"
              placeholder={t("enterYourPhoneNumber")}
              fieldProps={formik.getFieldProps("phone")}
              error={formik.errors.phone}
              touched={formik.touched.phone}
              maxLength={10}
            />

            <PasswordField
              label={t("password")}
              icon={FaLock}
              placeholder={t("enterYourPassword")}
              fieldProps={formik.getFieldProps("password")}
              error={formik.errors.password}
              touched={formik.touched.password}
            />

            <PasswordField
              label={t("confirmPassword")}
              icon={FaLock}
              placeholder={t("confirmYourPassword")}
              fieldProps={formik.getFieldProps("confirmPassword")}
              error={formik.errors.confirmPassword}
              touched={formik.touched.confirmPassword}
            />

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <SubmitButton
                isLoading={isLoading}
                loadingText={t("signingUp")}
                className="mt-2"
              >
                {t("signUp")}
              </SubmitButton>
            </motion.div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-sub">
              {t("alreadyHaveAccount") || "Already have an account?"}{" "}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/login")}
                className="text-brand-sky font-medium hover:underline inline-block"
              >
                {t("signIn")}
              </motion.button>
            </p>
          </div>
        </div>
      </motion.div>
    </AuthLayout>
  );
};

export default SmartSignUp;
