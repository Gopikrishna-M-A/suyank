import { auth, signIn, signOut } from "@acme/auth";
import { Button } from "@acme/ui/button";

import { getI18n } from "~/locales/server";
import { AuthModal } from "./AuthModal";

export async function AuthShowcase() {
  const t = await getI18n();
  const session = await auth();

  if (!session) {
    return (
      <AuthModal
        googleSignIn={
          <form>
            <Button
              size="lg"
              className="w-full"
              formAction={async () => {
                "use server";
                await signIn("google");
              }}
            >
              {t("sign_in_with_google")}
            </Button>
          </form>
        }
      />
    );
  }

  return (
    <>
      <div className="flex items-center justify-end gap-4">
        <p className="text-md text-center">
          <span>{session.user.name}</span>
        </p>

        <form>
          <Button
            size="lg"
            formAction={async () => {
              "use server";
              await signOut();
            }}
          >
            {t("sign_out")}
          </Button>
        </form>
      </div>
    </>
  );
}
