import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  AlertCircle,
  Loader2,
  Globe,
  GraduationCap,
  BookOpen,
  FlaskConical,
  User,
  Mail,
  Lock
} from 'lucide-react';
import { api } from '../services/api';
import { useData } from '../context/DataContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Auth({ navigate, redirectTo, onAuthComplete }) {
  const { login, register, user } = useAuth();

  // Navigation active: 'login' ou 'register'
  const [authMode, setAuthMode] = useState('login');

  // Étape d'inscription: 1 (Identité) ou 2 (Affiliation)
  const [registerStep, setRegisterStep] = useState(1);

  // États des formulaires
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    countryId: '',
    universityId: '',
    branchId: '',
    role: 'ETUDIANT'  // Rôle sélectionné à l'étape 1 : 'ETUDIANT' ou 'CHERCHEUR'
  });

  // Consommation du cache global des métadonnées organisationnelles
  const { countries, getUniversitiesByCountry, getBranchesByUniversity, loading: loadingMeta } = useData();

  // Filtrage en mémoire direct sans aucun appel réseau ou temps de latence
  const universities = getUniversitiesByCountry(registerData.countryId);
  const branches = getBranchesByUniversity(registerData.universityId);

  // Visibilité des mots de passe
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Gestion des messages de retour (Succès & Erreurs)
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Ref pour le focus de l'étape 2 (sélecteur pays)
  const countrySelectRef = useRef(null);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (user) {
      if (redirectTo?.pageName) {
        navigate(redirectTo.pageName, redirectTo.params || {})
        onAuthComplete?.()
      } else {
        navigate('dashboard');
      }
    }
  }, [user, navigate, redirectTo, onAuthComplete]);

  // Gérer le focus lors de la transition à l'étape 2
  useEffect(() => {
    if (registerStep === 2 && countrySelectRef.current) {
      countrySelectRef.current.focus();
    }
  }, [registerStep]);

  // Réinitialiser les messages d'erreur lors du switch de mode
  const handleModeChange = (mode) => {
    setAuthMode(mode);
    setErrorMsg('');
    setSuccessMsg('');
    setRegisterStep(1);
  };

  // Soumission Connexion
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      setErrorMsg("Veuillez remplir tous les champs requis.");
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await login(loginData.email, loginData.password);
    setLoading(false);

    if (res.success) {
      setSuccessMsg("Connexion réussie ! Redirection...");
      setTimeout(() => {
        if (redirectTo?.pageName) {
          navigate(redirectTo.pageName, redirectTo.params || {})
          onAuthComplete?.()
        } else {
          navigate('dashboard');
        }
      }, 1000);
    } else {
      setErrorMsg(res.message || "Erreur de connexion. Veuillez réessayer.");
    }
  };

  // Soumission Inscription - Validation Étape 1 (Identité)
  const handleRegisterStep1Submit = (e) => {
    e.preventDefault();
    const { firstName, lastName, email, password, confirmPassword } = registerData;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setErrorMsg("Tous les champs sont obligatoires.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Les mots de passe ne correspondent pas.");
      return;
    }

    setErrorMsg('');
    setRegisterStep(2);
  };

  // Soumission Inscription - Finale (Étape 2 - Affiliation réelle)
  const handleRegisterFinalSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, password, countryId, universityId, branchId } = registerData;

    if (!countryId) {
      setErrorMsg("Veuillez sélectionner un pays de recherche.");
      return;
    }
    if (!universityId) {
      setErrorMsg("Veuillez sélectionner une université partenaire.");
      return;
    }
    if (!branchId) {
      setErrorMsg("Veuillez sélectionner votre branche universitaire pour valider votre affiliation.");
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await register({
      email,
      password,
      firstName,
      lastName,
      branchId: Number(branchId),
      role: registerData.role || 'ETUDIANT'
    });
    setLoading(false);

    if (res.success) {
      const roleLabel = registerData.role === 'CHERCHEUR' ? 'chercheur' : 'étudiant';
      setSuccessMsg(`Votre compte ${roleLabel} a été créé et connecté avec succès ! Redirection...`);
      setTimeout(() => {
        if (redirectTo?.pageName) {
          navigate(redirectTo.pageName, redirectTo.params || {})
          onAuthComplete?.()
        } else {
          navigate('dashboard');
        }
      }, 1500);
    } else {
      setErrorMsg(res.message || "Impossible de finaliser l'inscription.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#080B14] relative overflow-x-hidden">

      {/* 🌌 Halos cosmiques d'arrière-plan */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-primary/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fieri-blue/10 blur-[120px] pointer-events-none" />

      {/* ========================================== */}
      {/* 🖼️ PANNEAU DE GAUCHE : VISUEL ET CITATION */}
      {/* ========================================== */}
      <div className="w-full md:w-[48%] lg:w-[45%] shrink-0 relative min-h-[270px] md:min-h-screen overflow-hidden flex flex-col justify-center p-6 md:p-12 lg:p-12 border-b md:border-b-0 md:border-r border-border-subtle bg-bg-secondary mt-12">

        {/* Image de fond avec transition fluide lors du switch */}
        <AnimatePresence mode="wait">
          <motion.div
            key={authMode}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.35, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: authMode === 'login'
                ? "url('/fieri_login_bg.png')"
                : "url('/fieri_register_bg.png')"
            }}
          />
        </AnimatePresence>

        {/* Dégradé sombre pour lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080B14] via-[#080B14]/65 to-transparent pointer-events-none" />

        {/* Contenu textuel et statistiques */}
        <div className="relative z-10 flex flex-col gap-5 md:gap-7">

          {/* Badge Eyebrow */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-fieri-blue animate-pulse-dot" />
            <span className="text-[10px] font-black tracking-[0.25em] uppercase text-fieri-blue">
              FIERI RESEARCH
            </span>
          </div>

          {/* Citation dynamique */}
          <div className="min-h-[100px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={authMode}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <blockquote className="text-xl md:text-2xl lg:text-2xl font-extrabold text-text-primary leading-tight font-sans tracking-tight">
                  {authMode === 'login'
                    ? "« La recherche est le moteur de demain. »"
                    : "« Innover ensemble, changer l'Afrique. »"
                  }
                </blockquote>
                <cite className="block text-[11px] font-bold uppercase tracking-widest text-text-secondary mt-3.5 not-italic">
                  {authMode === 'login' ? "— FIERI RESEARCH" : "— COMMUNAUTÉ FIERI"}
                </cite>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bento Card des Statistiques */}
          <div className="glass-panel border border-border-subtle/80 bg-[#0D1120]/45 p-5 md:p-6 rounded-2xl shadow-2xl backdrop-blur-md hidden sm:block">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xl lg:text-2xl font-black text-fieri-blue">5 000+</div>
                <div className="text-[9px] uppercase tracking-wider text-text-secondary font-bold mt-1">MEMBRES</div>
              </div>
              <div className="border-l border-border-subtle pl-4">
                <div className="text-xl lg:text-2xl font-black text-fieri-blue">12</div>
                <div className="text-[9px] uppercase tracking-wider text-text-secondary font-bold mt-1">PAYS</div>
              </div>
              <div className="border-l border-border-subtle pl-4">
                <div className="text-xl lg:text-2xl font-black text-fieri-blue">6</div>
                <div className="text-[9px] uppercase tracking-wider text-text-secondary font-bold mt-1">CLUBS</div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================== */}
      {/* 📝 PANNEAU DE DROITE : FORMULAIRES ACTIFS */}
      {/* ========================================== */}
      <div className="flex-1 flex flex-col justify-start items-center px-4 pt-6 pb-10 md:pt-24 md:pb-14 lg:px-16 md:h-screen md:overflow-y-auto">

        <div className="w-full max-w-[460px] flex flex-col gap-6 relative py-3 md:py-5">

          {/* 1. Pill Switcher (Boutons Connexion / Inscription) */}
          <div className="flex justify-center">
            <div className="flex p-1 rounded-full border border-border-subtle bg-bg-secondary/60 backdrop-blur-lg w-full max-w-[340px] relative">
              <button
                onClick={() => handleModeChange('login')}
                className={`flex-1 text-center py-2 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all z-10 cursor-pointer ${authMode === 'login'
                  ? 'text-text-primary bg-accent-primary/30 border border-accent-primary/20 shadow-inner'
                  : 'text-text-secondary hover:text-text-primary'
                  }`}
              >
                Connexion
              </button>
              <button
                onClick={() => handleModeChange('register')}
                className={`flex-1 text-center py-2 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all z-10 cursor-pointer ${authMode === 'register'
                  ? 'text-text-primary bg-accent-primary/30 border border-accent-primary/20 shadow-inner'
                  : 'text-text-secondary hover:text-text-primary'
                  }`}
              >
                Inscription
              </button>
            </div>
          </div>

          {/* 2. Affichage des messages de statut */}
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-300 text-xs"
                role="alert"
                id="auth-error-message"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-emerald-300 text-xs"
                role="alert"
                id="auth-success-message"
              >
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3. Formulaire Actif */}
          <AnimatePresence mode="wait">

            {/* 🚪 CAS : CONNEXION */}
            {authMode === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col gap-1.5">
                  <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Bon retour</h1>
                  <p className="text-xs text-text-secondary">Connectez-vous pour accéder à votre espace membre.</p>
                </div>

                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
                      ADRESSE EMAIL <span className="text-fieri-blue">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="email"
                        required
                        placeholder="oktav@fieri.dev"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        aria-invalid={!!errorMsg}
                        aria-describedby={errorMsg ? "auth-error-message" : undefined}
                        className="w-full bg-[#0D1120]/60 border border-border-subtle focus:border-fieri-blue/40 rounded-xl py-3 pl-11 pr-4 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted"
                      />
                    </div>
                  </div>

                  {/* Mot de passe */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
                        MOT DE PASSE <span className="text-fieri-blue">*</span>
                      </label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        required
                        placeholder="••••••••••••"
                        autoComplete="new-password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        aria-invalid={!!errorMsg}
                        aria-describedby={errorMsg ? "auth-error-message" : undefined}
                        className="w-full bg-[#0D1120]/60 border border-border-subtle focus:border-fieri-blue/40 rounded-xl py-3 pl-11 pr-12 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-fieri-blue to-[#00aeef] hover:from-fieri-blue/95 hover:to-[#00aeef]/95 text-white font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(27,111,216,0.3)] hover:shadow-[0_6px_24px_rgba(27,111,216,0.45)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer mt-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Se connecter</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center text-xs text-text-secondary mt-2">
                  Pas encore membre ?{' '}
                  <button
                    onClick={() => handleModeChange('register')}
                    className="text-fieri-blue font-bold hover:underline cursor-pointer"
                  >
                    Créer un compte
                  </button>
                </p>
              </motion.div>
            )}

            {/* 📝 CAS : INSCRIPTION */}
            {authMode === 'register' && (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                {/* En-tête */}
                <div className="flex flex-col gap-1.5">
                  <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Rejoindre FIERI</h1>
                  <p className="text-xs text-text-secondary">Créez votre compte et rejoignez un club de recherche.</p>
                </div>

                {/* Barre d'étapes (Steps Tracker) */}
                <div className="flex items-center gap-3 py-1 px-0.5 select-none">
                  {/* Étape 1 */}
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${registerStep === 1
                      ? 'bg-fieri-blue text-white shadow-[0_0_12px_rgba(27,111,216,0.4)]'
                      : 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-400'
                      }`}>
                      {registerStep > 1 ? <Check className="w-3.5 h-3.5" /> : "1"}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${registerStep === 1 ? 'text-fieri-blue' : 'text-emerald-400'
                      }`}>
                      IDENTITÉ
                    </span>
                  </div>

                  {/* Connecteur */}
                  <div className={`flex-1 h-[1px] transition-colors ${registerStep > 1 ? 'bg-emerald-500/40' : 'bg-border-subtle'
                    }`} />

                  {/* Étape 2 */}
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-colors ${registerStep === 2
                      ? 'bg-fieri-blue border-transparent text-white shadow-[0_0_12px_rgba(27,111,216,0.4)]'
                      : 'bg-bg-secondary border-border-subtle text-text-muted'
                      }`}>
                      2
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${registerStep === 2 ? 'text-fieri-blue' : 'text-text-muted'
                      }`}>
                      AFFILIATION
                    </span>
                  </div>
                </div>

                {/* Formulaires d'inscription par étape */}
                <AnimatePresence mode="wait">
                  {registerStep === 1 ? (

                    /* 📝 ÉTAPE 1 : IDENTITÉ */
                    <motion.form
                      key="step1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onSubmit={handleRegisterStep1Submit}
                      className="flex flex-col gap-4"
                    >
                      {/* Prénom & Nom */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
                            PRÉNOM <span className="text-fieri-blue">*</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                              type="text"
                              required
                              placeholder="Kofi"
                              value={registerData.firstName}
                              onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                              aria-invalid={!!errorMsg}
                              aria-describedby={errorMsg ? "auth-error-message" : undefined}
                              className="w-full bg-[#0D1120]/60 border border-border-subtle focus:border-fieri-blue/40 rounded-xl py-3 pl-11 pr-4 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
                            NOM <span className="text-fieri-blue">*</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                              type="text"
                              required
                              placeholder="Asante"
                              value={registerData.lastName}
                              onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                              aria-invalid={!!errorMsg}
                              aria-describedby={errorMsg ? "auth-error-message" : undefined}
                              className="w-full bg-[#0D1120]/60 border border-border-subtle focus:border-fieri-blue/40 rounded-xl py-3 pl-11 pr-4 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
                          EMAIL <span className="text-fieri-blue">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                          <input
                            type="email"
                            required
                            placeholder="vous@email.com"
                            value={registerData.email}
                            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                            aria-invalid={!!errorMsg}
                            aria-describedby={errorMsg ? "auth-error-message" : undefined}
                            className="w-full bg-[#0D1120]/60 border border-border-subtle focus:border-fieri-blue/40 rounded-xl py-3 pl-11 pr-4 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted"
                          />
                        </div>
                      </div>

                      {/* Mot de passe */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
                          MOT DE PASSE <span className="text-fieri-blue">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                          <input
                            type={showRegisterPassword ? "text" : "password"}
                            required
                            placeholder="Min. 8 caractères"
                            autoComplete="new-password"
                            value={registerData.password}
                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                            aria-invalid={!!errorMsg}
                            aria-describedby={errorMsg ? "auth-error-message" : undefined}
                            className="w-full bg-[#0D1120]/60 border border-border-subtle focus:border-fieri-blue/40 rounded-xl py-3 pl-11 pr-12 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                          >
                            {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirmer le Mot de passe */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
                          CONFIRMER LE MOT DE PASSE <span className="text-fieri-blue">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            placeholder="••••••••"
                            autoComplete="new-password"
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                            aria-invalid={!!errorMsg}
                            aria-describedby={errorMsg ? "auth-error-message" : undefined}
                            className="w-full bg-[#0D1120]/60 border border-border-subtle focus:border-fieri-blue/40 rounded-xl py-3 pl-11 pr-12 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Continuer */}
                      <button
                        type="submit"
                        className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-fieri-blue to-[#00aeef] hover:from-fieri-blue/95 hover:to-[#00aeef]/95 text-white font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(27,111,216,0.3)] hover:shadow-[0_6px_24px_rgba(27,111,216,0.45)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer mt-2"
                      >
                        <span>Continuer</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </motion.form>
                  ) : (

                    /* 🏛️ ÉTAPE 2 : AFFILIATION UNIVERSITAIRE */
                    <motion.form
                      key="step2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onSubmit={handleRegisterFinalSubmit}
                      className="flex flex-col gap-4"
                    >
                      {/* Pays */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
                          PAYS DE RECHERCHE <span className="text-fieri-blue">*</span>
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                          <select
                            ref={countrySelectRef}
                            required
                            value={registerData.countryId}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRegisterData(prev => ({
                                ...prev,
                                countryId: val,
                                universityId: '',
                                branchId: ''
                              }));
                            }}
                            aria-invalid={!!errorMsg}
                            aria-describedby={errorMsg ? "auth-error-message" : undefined}
                            className="w-full bg-[#0D1120]/60 border border-border-subtle focus:border-fieri-blue/40 rounded-xl py-3.5 pl-11 pr-4 text-sm text-text-primary outline-none transition-all appearance-none cursor-pointer"
                          >
                            <option value="">Sélectionnez un pays</option>
                            {countries.map(c => (
                              <option key={c.id} value={c.id} className="bg-[#080B14]">
                                {c.name}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l border-border-subtle pl-2.5">
                            <span className="text-[9px] font-bold text-text-muted">▼</span>
                          </div>
                        </div>
                      </div>

                      {/* Université (Désactivé si aucun pays sélectionné) */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
                          UNIVERSITÉ PARTENAIRE <span className="text-fieri-blue">*</span>
                        </label>
                        <div className="relative">
                          <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                          <select
                            required
                            disabled={!registerData.countryId || loadingMeta}
                            value={registerData.universityId}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRegisterData(prev => ({
                                ...prev,
                                universityId: val,
                                branchId: ''
                              }));
                            }}
                            aria-invalid={!!errorMsg}
                            aria-describedby={errorMsg ? "auth-error-message" : undefined}
                            className="w-full bg-[#0D1120]/60 border border-border-subtle focus:border-fieri-blue/40 rounded-xl py-3.5 pl-11 pr-4 text-sm text-text-primary outline-none transition-all appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <option value="">
                              {loadingMeta ? "Chargement..." : "Sélectionnez votre université"}
                            </option>
                            {universities.map(u => (
                              <option key={u.id} value={u.id} className="bg-[#080B14]">
                                {u.name}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l border-border-subtle pl-2.5">
                            <span className="text-[9px] font-bold text-text-muted">▼</span>
                          </div>
                        </div>
                      </div>

                      {/* Branche / Pôle (Désactivé si aucune université sélectionnée) */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-text-secondary">
                          BRANCHE / PÔLE ACADÉMIQUE <span className="text-fieri-blue">*</span>
                        </label>
                        <div className="relative">
                          <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                          <select
                            required
                            disabled={!registerData.universityId || loadingMeta}
                            value={registerData.branchId}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, branchId: e.target.value }))}
                            aria-invalid={!!errorMsg}
                            aria-describedby={errorMsg ? "auth-error-message" : undefined}
                            className="w-full bg-[#0D1120]/60 border border-border-subtle focus:border-fieri-blue/40 rounded-xl py-3.5 pl-11 pr-4 text-sm text-text-primary outline-none transition-all appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <option value="">
                              {loadingMeta ? "Chargement..." : "Sélectionnez votre branche"}
                            </option>
                            {branches.map(b => (
                              <option key={b.id} value={b.id} className="bg-[#080B14]">
                                {b.name}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l border-border-subtle pl-2.5">
                            <span className="text-[9px] font-bold text-text-muted">▼</span>
                          </div>
                        </div>
                      </div>

                      {/* Soumettre Inscription Finale */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-fieri-blue to-[#00aeef] hover:from-fieri-blue/95 hover:to-[#00aeef]/95 text-white font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(27,111,216,0.3)] hover:shadow-[0_6px_24px_rgba(27,111,216,0.45)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer mt-2"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>Finaliser mon inscription</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      {/* Retour à l'étape 1 */}
                      <button
                        type="button"
                        onClick={() => { setErrorMsg(''); setRegisterStep(1); }}
                        className="w-full py-2.5 text-center text-xs font-bold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                      >
                        ← Modifier mes informations d'identité
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>

                <p className="text-center text-xs text-text-secondary mt-2">
                  Déjà membre de la communauté ?{' '}
                  <button
                    onClick={() => handleModeChange('login')}
                    className="text-fieri-blue font-bold hover:underline cursor-pointer"
                  >
                    Se connecter
                  </button>
                </p>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Mentions légales */}
          <div className="text-center text-[10px] text-text-muted leading-relaxed select-none">
            En vous connectant ou en vous inscrivant, vous acceptez nos{' '}
            <a href="#" className="underline hover:text-text-secondary">conditions d'utilisation</a>{' '}
            et notre{' '}
            <a href="#" className="underline hover:text-text-secondary">politique de confidentialité</a>.
          </div>

        </div>

      </div>

    </div>
  );
}
