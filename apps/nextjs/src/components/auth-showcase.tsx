"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

import { Button } from "@acme/ui/button";

import { createQueryString } from "~/lib/createQueryString";
import { useI18n } from "~/locales/client";
import { AuthModal } from "./AuthModal";

export function AuthShowcase() {
  const t = useI18n();
  const session = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (
      session?.status === "authenticated" &&
      searchParams.get("authModal") === "true"
    ) {
      router.push(
        pathname +
          "?" +
          createQueryString("authModal", undefined, searchParams),
      );
    }
  }, [session?.status]);

  if (!session?.data?.user) {
    return (
      <AuthModal
        googleSignIn={
          <form>
            <Button
              size="lg"
              className="w-full"
              formAction={() => {
                signIn("google");
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
          <span>{session?.data?.user?.name}</span>
        </p>

        <form>
          <Button
            size="lg"
            formAction={() => {
              signOut();
            }}
          >
            {t("sign_out")}
          </Button>
        </form>
      </div>
    </>
  );
}
