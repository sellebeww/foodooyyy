// src/components/TeamSection.tsx
import { useT, type MessageKey } from "../i18n/index.ts";

const MEMBERS: readonly { name: string; role: MessageKey }[] = [
  { name: "Hakim Ulinnuha", role: "landing.team.domain" },
  { name: "Samuel Matthew", role: "landing.team.data" },
  { name: "Vassel Goleyu", role: "landing.team.screens" },
  { name: "Sonny Ferdinand", role: "landing.team.platform" },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("");
}

export function TeamSection() {
  const t = useT();
  return (
    <section id="team" className="band" aria-labelledby="landing-team">
      <div className="band__inner">
        <div className="band__head">
          <p className="eyebrow">{t("landing.nav.team")}</p>
          <h2 id="landing-team">{t("landing.teamTitle")}</h2>
          <p>{t("landing.teamBody")}</p>
        </div>
        <ul className="team">
          {MEMBERS.map((member) => (
            <li key={member.name} className="team__card">
              <span className="team__initials" aria-hidden="true">
                {initials(member.name)}
              </span>
              <h3>{member.name}</h3>
              <p>{t(member.role)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
