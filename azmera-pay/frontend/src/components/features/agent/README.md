# Agent flow components

Farmer management:

- `FarmerList.tsx`, `FarmerForm.tsx`, `FarmerDetail.tsx`, `FarmerRegistrationWizard.tsx`

Agent self-signup (used by `pages/auth/AgentSignup.tsx`):

- `AgentSignupHero.tsx` - brand hero: Azmera logo + "Connect · Trade · Grow" tagline,
  full-bleed agent photo, and a translucent dark-green benefits panel (Lucide icons)
- `AgentSignupFooter.tsx` - compact auth footer with logo and links
- `AgentSignupWizard.tsx` - 4-step form: personal, identity, agent details, security & review
- `AgentSignupSuccess.tsx` - success panel shown after account creation
