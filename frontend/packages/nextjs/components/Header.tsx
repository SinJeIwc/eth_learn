"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import { Bars3Icon, BugAntIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useScaffoldReadContract, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "🌾 Farm Game",
    href: "/game",
  },
  {
    label: "Debug Contracts",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-secondary shadow-md" : ""
              } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const { address: connectedAddress } = useAccount();
  const { writeContractAsync, isPending } = useScaffoldWriteContract("FarmCoin");

  // Читаем баланс FarmCoin
  const { data: farmCoinBalance } = useScaffoldReadContract({
    contractName: "FarmCoin",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  const handleClaimTokens = async () => {
    if (!connectedAddress) {
      console.log("⚠️ No wallet connected");
      return;
    }

    try {
      console.log("🎁 Claiming tokens from faucet...");
      console.log("📍 Wallet address:", connectedAddress);

      const result = await writeContractAsync({
        functionName: "claimTokens",
      });

      console.log("✅ Transaction sent:", result);
      console.log("✅ Successfully claimed 1000 FarmCoin tokens!");
      alert("🎉 Successfully claimed 1000 FarmCoin tokens!");
    } catch (error: any) {
      console.error("❌ Error claiming tokens:", error);

      // Проверяем специфичные ошибки
      if (error?.message?.includes("Claim cooldown not expired")) {
        alert("⏰ Cooldown active! You can claim tokens once per hour.");
      } else if (error?.message?.includes("rejected")) {
        alert("❌ Transaction rejected by user");
      } else {
        alert("❌ Error claiming tokens. Check console for details.");
      }
    }
  };

  return (
    <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <details className="dropdown" ref={burgerMenuRef}>
          <summary className="ml-1 btn btn-ghost lg:hidden hover:bg-transparent">
            <Bars3Icon className="h-1/2" />
          </summary>
          <ul
            className="menu menu-compact dropdown-content mt-3 p-2 shadow-sm bg-base-100 rounded-box w-52"
            onClick={() => {
              burgerMenuRef?.current?.removeAttribute("open");
            }}
          >
            <HeaderMenuLinks />
          </ul>
        </details>
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex relative w-10 h-10">
            <Image alt="SE2 logo" className="cursor-pointer" fill src="/logo.svg" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">Scaffold-ETH</span>
            <span className="text-xs">Ethereum dev stack</span>
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end grow mr-4 flex gap-2 items-center">
        {connectedAddress && (
          <>
            {/* Баланс FarmCoin */}
            <div className="badge badge-lg badge-success font-bold px-3">
              🪙 {farmCoinBalance ? Number(farmCoinBalance) / 10 ** 18 : 0} FARM
            </div>

            {/* Кнопка получения токенов */}
            <button className="btn btn-sm btn-primary" onClick={handleClaimTokens} disabled={isPending}>
              {isPending ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Claiming...
                </>
              ) : (
                <>💰 Получить токены</>
              )}
            </button>
          </>
        )}
        <RainbowKitCustomConnectButton />
        {isLocalNetwork && <FaucetButton />}
      </div>
    </div>
  );
};
