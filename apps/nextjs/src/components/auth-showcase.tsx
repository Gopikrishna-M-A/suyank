"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import dynamic from 'next/dynamic';

import { Button } from "@acme/ui/button";

import { createQueryString } from "~/lib/createQueryString";
import { useI18n } from "~/locales/client";

const AuthModal = dynamic(() => import("./AuthModal").then(mod => mod.AuthModal), {
  ssr: false,
});

export function AuthShowcase() {
  const t = useI18n();
  const session = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsModalOpen(searchParams.get("authModal") === "true" && session.status !== "authenticated");
  }, [searchParams, session.status]);

  useEffect(() => {
    if (session?.status === "authenticated" && isModalOpen) {
      setIsModalOpen(false);
      router.push(
        pathname +
          "?" +
          createQueryString("authModal", undefined, searchParams),
        { shallow: true }
      );
    }
  }, [session?.status, isModalOpen, pathname, router, searchParams]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    router.push(pathname, { shallow: true });
  };

  if (session?.data?.user) {
    return (
      <div className="flex items-center justify-end gap-4">
        <p className="text-md text-center">
          <span>{session.data.user.name}</span>
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
    );
  }

  return (
    <>
      <Button
        size="lg"
        onClick={() => setIsModalOpen(true)}
      >
        {t("sign_in")}
      </Button>
      {isModalOpen && (
        <AuthModal
          onClose={handleCloseModal}
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
      )}
    </>
  );
}