import "../../../scripts/button/button.css";
import { avatar, DISCORD_ID } from "../data";
import { isLight, useDiscordProfile } from "../lib/hooks";
import { useLanyard } from "../lib/lanyard";

export default function LiveButton({ className = "" }: { className?: string }) {
  const p = useLanyard();
  const theme = useDiscordProfile(DISCORD_ID)?.theme;
  const [a, b] = theme ?? ["#080808", "#bcbcbc"];
  const fg = isLight(a) ? `color-mix(in oklab, ${b} 30%, #1d1615)` : "#fff";

  return (
    <span
      className={`x8r-btn live ${className}`}
      style={{ ["--a" as string]: a, ["--b" as string]: b, ["--fg" as string]: fg }}
      role="img"
      aria-label="xrompf 88x31 button"
    >
      <span className="pfp">
        <img src={p.avatar ?? avatar(96)} alt="" />
      </span>
      {p.decoration && <img className="deco" src={p.decoration} alt="" />}
      <span className="t">
        xrompf<span className="cur">_</span>
      </span>
    </span>
  );
}
