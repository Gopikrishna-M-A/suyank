"use client";

import { ReactNode, useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { signIn } from "@acme/auth";
import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";
import { Input } from "@acme/ui/input";

import { createQueryString } from "~/lib/createQueryString";
import { useI18n } from "~/locales/client";

interface Props {
  googleSignIn: ReactNode;
}

export function AuthModal({ googleSignIn }: Props) {
  const t = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const authModal = searchParams.get("authModal");

  const [email, setEmail] = useState("");

  return (
    <>
      <Button
        size="lg"
        className="w-auto"
        onClick={() => {
          router.push(
            pathname + "?" + createQueryString("authModal", true, searchParams),
          );
        }}
      >
        {t("sign_in")}
      </Button>

      <Dialog
        open={authModal === "true"}
        onOpenChange={(open) =>
          !open &&
          router.push(
            pathname +
              "?" +
              createQueryString("authModal", undefined, searchParams),
          )
        }
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("sign_in")}</DialogTitle>
          </DialogHeader>

          {googleSignIn}

          <div className="my-2 flex justify-center">{t("or")}</div>

          <div>
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button className="mt-2 w-full">{t("sign_in_email")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
