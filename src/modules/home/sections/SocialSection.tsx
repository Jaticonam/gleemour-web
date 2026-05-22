import { Sparkles } from "lucide-react";
import HomeSectionHeader from "../components/HomeSectionHeader";

import {
  FacebookIcon,
  GoogleIcon,
  InstagramIcon,
  PinterestIcon,
  TikTokIcon,
  XIcon,
  YoutubeIcon,
} from "@/shared/components/ui/SocialIcons";

const socials = [
  {
    label: "video",
    title: "TikTok",
    description: "Ideas, detalles y momentos especiales",
    icon: TikTokIcon,
    link: "https://www.tiktok.com/@gleemour",
    normalIcon: "bg-[#ECA4C2]/20 text-[#D98AAD] border-[#ECA4C2]/40",
    hover: "group-hover:bg-black group-hover:text-white group-hover:border-black",
    text: "group-hover:text-black",
  },
  {
    label: "comunidad",
    title: "Facebook",
    description: "Promos, novedades y campañas",
    icon: FacebookIcon,
    link: "https://www.facebook.com/gleemour",
    normalIcon: "bg-[#6A5A8A]/10 text-[#6A5A8A] border-[#6A5A8A]/20",
    hover: "group-hover:bg-[#1877f2] group-hover:text-white group-hover:border-[#1877f2]",
    text: "group-hover:text-[#1877f2]",
  },
  {
    label: "visual",
    title: "Instagram",
    description: "Inspiración para regalar mejor",
    icon: InstagramIcon,
    link: "https://www.instagram.com/gleemour",
    normalIcon: "bg-[#ECA4C2]/20 text-[#D98AAD] border-[#ECA4C2]/40",
    hover: "group-hover:bg-[#e4405f] group-hover:text-white group-hover:border-[#e4405f]",
    text: "group-hover:text-[#e4405f]",
  },
  {
    label: "ideas",
    title: "Pinterest",
    description: "Moodboards e inspiración floral",
    icon: PinterestIcon,
    link: "https://www.pinterest.com/gleemour",
    normalIcon: "bg-[#F9C95B]/10 text-[#F9C95B] border-[#F9C95B]/30",
    hover: "group-hover:bg-[#bd081c] group-hover:text-white group-hover:border-[#bd081c]",
    text: "group-hover:text-[#bd081c]",
  },
  {
    label: "noticias",
    title: "X",
    description: "Actualizaciones rápidas",
    icon: XIcon,
    link: "https://x.com/gleemour",
    normalIcon: "bg-[#6A5A8A]/10 text-[#6A5A8A] border-[#6A5A8A]/20",
    hover: "group-hover:bg-black group-hover:text-white group-hover:border-black",
    text: "group-hover:text-black",
  },
  {
    label: "video",
    title: "YouTube",
    description: "Historias, arreglos y experiencias",
    icon: YoutubeIcon,
    link: "https://www.youtube.com/@gleemour",
    normalIcon: "bg-[#ECA4C2]/20 text-[#D98AAD] border-[#ECA4C2]/40",
    hover: "group-hover:bg-[#ff0000] group-hover:text-white group-hover:border-[#ff0000]",
    text: "group-hover:text-[#ff0000]",
  },
  {
    label: "reseñas",
    title: "Google",
    description: "Opiniones y confianza real",
    icon: GoogleIcon,
    link: "https://www.google.com/search?q=Gleemour",
    normalIcon: "bg-[#6A5A8A]/10 text-[#6A5A8A] border-[#6A5A8A]/20",
    hover: "group-hover:bg-[#4285f4] group-hover:text-white group-hover:border-[#4285f4]",
    text: "group-hover:text-[#4285f4]",
  },
];

export default function SocialSection() {
  return (
    <section className="home-container pt-8 pb-12 md:pt-10 md:pb-14">
      <HomeSectionHeader
        icon={Sparkles}
        kicker="Conecta con Gleemour"
        title="Síguenos e inspírate para regalar mejor"
        description="Ideas, detalles, campañas y momentos especiales para transformar emociones en experiencias."
        align="center"
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {socials.map(({ title, link, icon: Icon, normalIcon, hover, text, description, label }) => (
          <a
            key={title}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={title}
            className="group flex min-h-[150px] flex-col items-center justify-center rounded-[26px] border border-slate-200/80 bg-white p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.03] hover:shadow-xl"
          >
            <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border shadow-sm transition-all duration-300 group-hover:scale-110 ${normalIcon} ${hover}`}>
              <Icon className="h-6 w-6" />
            </div>

            <h3 className={`text-base font-extrabold text-slate-950 transition-colors duration-300 ${text}`}>
              {title}
            </h3>

            <p className="mt-1 text-xs font-medium leading-snug text-slate-500">
              {description}
            </p>

            <span className="mt-3 rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500 transition-all duration-300 group-hover:bg-slate-900 group-hover:text-white">
              {label}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
