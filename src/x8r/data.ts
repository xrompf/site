export const DISCORD_ID = "1044645799746883615";
export const GITHUB = "xrompf";
export const COUNTER = "https://counter.x8r.dev";

// xrompf's GitHub account id so avatar resolves directly and survives renames
export const GITHUB_ID = 148499988;
export const avatar = (size = 256) => `https://avatars.githubusercontent.com/u/${GITHUB_ID}?s=${size}`;

export type Crew = { name: string; href?: string; role: string; icon?: string; blurb?: string };

export const RUNNING: Crew[] = [
  {
    name: "cherri",
    href: "https://cherrion.top/",
    role: "co-owner",
    icon: "https://cherrion.top/assets/img/fav.png",
    blurb: "an all-in-one site: chat, play, watch, browse, and more",
  },
  {
    name: "breeze",
    href: "https://breezeunb.locker/",
    role: "owner",
    icon: "/img/logos/breeze.webp",
  },
];

export type Repo = { name: string; href: string; blurb: string; icon?: string; glyph?: "music" | "movies"; tag: string };

export const REPOS: Repo[] = [
  {
    name: "stratus",
    href: "https://github.com/xrompf",
    blurb: "cloud gaming api: drop 180+ aaa titles into any website",
    icon: "/img/stratus.svg",
    tag: "api",
  },
  {
    name: "sapphire",
    href: "https://github.com/xrompf",
    blurb: "run mv3 chrome extensions inside a website, as a scramjet plugin",
    icon: "/img/sapphire.png",
    tag: "lib",
  },
  {
    name: "music",
    href: "https://github.com/xrompf",
    blurb: "a music api that just works",
    glyph: "music",
    tag: "api",
  },
  {
    name: "movies",
    href: "https://github.com/xrompf",
    blurb: "a movies api",
    glyph: "movies",
    tag: "api",
  },
  {
    name: "gmshelf",
    href: "https://github.com/xrompf",
    blurb: "game delivery api",
    icon: "/img/logos/gmshelf.png",
    tag: "api",
  },
];

export type Social = { key: "youtube" | "tiktok" | "discord" | "github"; label: string; href: string };

export const SOCIALS: Social[] = [
  { key: "youtube", label: "youtube", href: "https://youtube.com/@xrompf" },
  { key: "tiktok", label: "tiktok", href: "https://tiktok.com/@xrompf" },
  { key: "discord", label: "discord", href: `https://discord.com/users/${DISCORD_ID}` },
  { key: "github", label: "github", href: `https://github.com/${GITHUB}` },
];

export type ButtonItem = { src: string; alt: string; href?: string; live?: boolean };

export const BUTTONS: ButtonItem[] = [
  { src: "/img/button.gif", alt: "xrompf", live: true },
  { src: "/img/buttons/geeked.png", alt: "geeked.wtf", href: "https://geeked.wtf/" },
  { src: "/img/buttons/github.png", alt: "GitHub", href: "https://github.com/xrompf" },
  { src: "/img/buttons/discord.png", alt: "Discord", href: `https://discord.com/users/${DISCORD_ID}` },
  { src: "/img/buttons/spotify.png", alt: "Spotify", href: "https://spotify.com/" },
  { src: "/img/buttons/steam.png", alt: "Steam", href: "https://store.steampowered.com/" },
  { src: "/img/buttons/vscode.png", alt: "VS Code", href: "https://code.visualstudio.com/" },
  { src: "/img/buttons/ublock.png", alt: "uBlock Origin", href: "https://ublockorigin.com/" },
  { src: "/img/buttons/endeavour.png", alt: "EndeavourOS", href: "https://endeavouros.com/" },
  { src: "/img/buttons/minecraft.png", alt: "Minecraft", href: "https://minecraft.net/" },
  { src: "/img/buttons/gd.png", alt: "Geometry Dash", href: "https://store.steampowered.com/app/322170/Geometry_Dash/" },
  { src: "/img/buttons/hollowknight.png", alt: "Hollow Knight", href: "https://store.steampowered.com/app/367520/Hollow_Knight/" },
  { src: "/img/buttons/slqnt.png", alt: "slqnt", href: "https://slqnt.dev" },
  { src: "/img/buttons/rogo.png", alt: "rogo.best", href: "https://rogo.best/" },
  { src: "/img/buttons/spark.png", alt: "spark", href: "https://github.com/problematicdesire" },
  { src: "/img/buttons/proudparrot.png", alt: "proudparrot2", href: "https://github.com/proudparrot2" },
  { src: "/img/buttons/technonyte.png", alt: "technonyte" },
  { src: "/img/buttons/starlight.jpg", alt: "starlight" },
  { src: "/img/buttons/react.png", alt: "React", href: "https://react.dev" },
  { src: "/img/buttons/helium.png", alt: "Helium", href: "https://helium.computer/" },
  { src: "/img/buttons/linux.png", alt: "GNU/Linux", href: "https://www.linux.org/" },
];
