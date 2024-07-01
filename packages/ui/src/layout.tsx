import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { getI18n } from "./locales/server";

type LayoutProps = {
  children: ReactNode;
  rightContent?: ReactNode;
  middleContent?: ReactNode;
};

const Layout = async ({
  children,
  rightContent,
  middleContent,
}: LayoutProps) => {
  const t = await getI18n();

  return (
    <div className="relative flex flex-col">
      <header className="container grid grid-cols-3 items-center py-4">
        <Link href="/">
          <Image src="/logo.svg" alt="" height={86} width={111} />
        </Link>

        {middleContent}

        {rightContent}
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
};

Layout.displayName = "Layout";

export { Layout };
