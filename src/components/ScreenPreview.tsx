// src/components/ScreenPreview.tsx
import { EXAMPLE_MENU, workedExample } from "../domain/explain.ts";
import { useT } from "../i18n/index.ts";
import { EstimateValue } from "./EstimateValue.tsx";

const example = workedExample();

export function ScreenPreview() {
  const t = useT();
  return (
    <ol className="preview">
      <li className="preview__step">
        <p className="preview__phase">{t("today.phase.service")}</p>
        <div className="preview__screen preview__screen--soldout">
          <strong className="preview__name">{EXAMPLE_MENU.name}</strong>
          <span className="stamp">
            {t("service.soldOutAt", { time: example.soldOutAt })}
          </span>
        </div>
        <p className="preview__note">{t("landing.preview.service")}</p>
      </li>
      <li className="preview__step">
        <p className="preview__phase">{t("today.phase.close")}</p>
        <div className="preview__screen">
          <strong className="preview__name">{EXAMPLE_MENU.name}</strong>
          <dl className="preview__rows">
            <div>
              <dt>{t("landing.exampleCooked")}</dt>
              <dd className="num">{example.cooked}</dd>
            </div>
            <div>
              <dt>{t("close.wanted")}</dt>
              <dd>
                <EstimateValue demand={example.demand} isEstimate />
              </dd>
            </div>
          </dl>
        </div>
        <p className="preview__note">{t("landing.preview.close")}</p>
      </li>
      <li className="preview__step">
        <p className="preview__phase">{t("landing.loopNextTitle")}</p>
        <div className="preview__screen preview__screen--next">
          <span className="preview__big num">≈ {example.demand}</span>
          <span className="est__tag">{t("estimate.tag")}</span>
        </div>
        <p className="preview__note">
          {t("landing.preview.next", { cooked: example.cooked })}
        </p>
      </li>
    </ol>
  );
}
