"use client";

import { ReactNode } from "react";

import { signIn } from "@acme/auth";
import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";

import { useI18n } from "~/locales/client";

interface Props {
  googleSignIn: ReactNode;
}

export function AuthModal({ googleSignIn }: Props) {
  const t = useI18n();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg">{t("sign_in")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("sign_in")}</DialogTitle>
        </DialogHeader>

        {googleSignIn}
      </DialogContent>
    </Dialog>
  );
}
