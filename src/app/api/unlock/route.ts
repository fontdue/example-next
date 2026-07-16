// Password-unlock endpoint for statically-cached font pages.
// NodePasswordForm POSTs the access token here after a successful accessNode
// unlock; the handler enables Next's draft-mode bypass, so this visitor's
// subsequent requests skip the full-route cache, render dynamically, and
// forward their node-access cookie — the unlocked collection resolves while
// everyone else keeps the static pages (which for a locked collection show
// the password form). Mirrors how /api/preview layers draft mode for admins.
export { POST } from "fontdue-js/next/unlock";
