import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { TOOLS as registry } from './registry';
import { DATA_HUB as dataNav, TOOLS as nav } from '@/features/layout/nav';
import { AID_FAQ, AID_HOWTO, AID_PAGE, AID_UI } from './ai-design/content';
import { BP_FAQ, BP_HOWTO, BP_PAGE } from './blueprint/content';
import { CG_FAQ, CG_HOWTO, CG_PAGE, CG_UI } from './capital-gains/content';
import { CHECKLIST_FAQ, CHECKLIST_HOWTO, CHECKLIST_PAGE, CHECKLIST_UI } from './checklist/content';
import { EMI_FAQ, EMI_HOWTO, EMI_PAGE, EMI_UI } from './emi/content';
import { LOAN_FAQ, LOAN_PAGE, LOAN_UI } from './loan/content';
import { VASTU_PAGE, VASTU_UI } from './vastu/content';
import { toolSchemas } from '@/lib/seo/legacy/toolSchemas.js';
import { COPY as homeCopy } from '@/features/home/copy';

const indexPage = readFileSync('src/features/tools/ToolsIndex.astro', 'utf8');
const capitalGainsPage = readFileSync('src/pages/capital-gains-tax-calculator.astro', 'utf8');
const emiPage = readFileSync('src/pages/emi-calculator.astro', 'utf8');
const fakeListingPage = readFileSync('src/pages/check-fake-listing.astro', 'utf8');
const vastuCheckerPage = readFileSync('src/features/tools/vastu/VastuChecker.tsx', 'utf8');
const enCommon = JSON.parse(readFileSync('src/i18n/locales/en/common.json', 'utf8')) as Record<string, unknown>;
const hiCommon = JSON.parse(readFileSync('src/i18n/locales/hi/common.json', 'utf8')) as Record<string, unknown>;
const enBlog = JSON.parse(readFileSync('src/i18n/locales/en/blog.json', 'utf8')) as Record<string, unknown>;
const hiBlog = JSON.parse(readFileSync('src/i18n/locales/hi/blog.json', 'utf8')) as Record<string, unknown>;
const blogToolsSource = readFileSync('src/features/blog/tools.ts', 'utf8');
const enTools = JSON.parse(readFileSync('src/i18n/locales/en/tools.json', 'utf8')) as Record<string, unknown>;
const hiTools = JSON.parse(readFileSync('src/i18n/locales/hi/tools.json', 'utf8')) as Record<string, unknown>;
const enSite = JSON.parse(readFileSync('src/i18n/locales/en/site.json', 'utf8')) as Record<string, unknown>;
const hiSite = JSON.parse(readFileSync('src/i18n/locales/hi/site.json', 'utf8')) as Record<string, unknown>;

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

function localeToolText(key: string): string {
  return [enTools[key], hiTools[key]].flatMap(strings).join('\n');
}

function localeSiteLinkText(key: string): string {
  const enLinks = enSite.links as Record<string, unknown>;
  const hiLinks = hiSite.links as Record<string, unknown>;
  return [enLinks[key], hiLinks[key]].flatMap(strings).join('\n');
}

describe('tool discovery claims', () => {
  it('does not promise free or account-free access', () => {
    const copy = [indexPage, JSON.stringify(registry), JSON.stringify(nav)].join('\n');
    expect(copy).not.toMatch(/\bfree\b|no sign-up|no account|मुफ़्त|साइन-अप नहीं|अकाउंट की ज़रूरत नहीं/i);
  });
});

describe('financial tool descriptions', () => {
  it('distinguishes estimates, pre-tax arithmetic, and held rates from confirmed outcomes', () => {
    const loan = registry.find((tool) => tool.key === 'loanEligibility')!;
    const capitalGains = registry.find((tool) => tool.key === 'capitalGains')!;
    const stampDuty = registry.find((tool) => tool.key === 'stampDuty')!;
    const rentReceipt = registry.find((tool) => tool.key === 'rentReceipt')!;
    const loanNav = nav.links.find((link) => link.key === 'site:links.loanEligibility')!;
    const gainsNav = nav.links.find((link) => link.key === 'site:links.capitalGains')!;
    const rentNav = nav.links.find((link) => link.key === 'site:links.rentReceipt')!;
    const stampNav = dataNav.links.find((link) => link.key === 'site:links.stampDuty')!;
    const stampSiteLink = localeSiteLinkText('stampDuty');

    expect(`${loan.desc.en} ${loanNav.desc?.en}`).toMatch(/estimate/i);
    expect(`${loan.desc.en} ${loanNav.desc?.en}`).toMatch(/lender|bank/i);
    expect(`${capitalGains.name.en} ${capitalGains.desc.en} ${gainsNav.desc?.en} ${localeSiteLinkText('capitalGains')}`).toMatch(/pre-tax|sale gain/i);
    expect(`${capitalGains.desc.en} ${gainsNav.desc?.en}`).toMatch(/does not estimate (income )?tax|no tax estimate/i);
    expect(`${stampDuty.name.en} ${stampDuty.desc.en} ${stampNav.desc?.en} ${stampSiteLink}`).toMatch(/withheld|under review|unavailable/i);
    expect(`${rentReceipt.desc.en} ${rentNav.desc?.en}`).toMatch(/does not determine.*eligibility|not.*eligibility/i);
    expect(`${loanNav.desc?.en} ${gainsNav.desc?.en} ${rentNav.desc?.en}`).not.toMatch(/how much loan you can get|tax when you sell a property|HRA claim/i);
  });

  it('keeps the sale worksheet to pre-tax arithmetic until tax sources are verified', () => {
    const capitalGains = registry.find((tool) => tool.key === 'capitalGains')!;
    const copy = [
      strings([CG_FAQ, CG_HOWTO, CG_PAGE, CG_UI]).join('\n'),
      localeToolText('capitalGains'),
      capitalGains.name.en,
      capitalGains.desc.en,
    ].join('\n');

    expect(copy).not.toMatch(/12\.5%|20%|section 54|indexation|cost inflation index|\bCII\b|धारा 54|12\.5%|20%/i);
    expect(copy).toMatch(/pre-tax|कर-पूर्व/i);
    expect(copy).toMatch(/does not estimate.*tax|does not apply tax|टैक्स.*अनुमान नहीं/i);
    expect(capitalGainsPage).not.toMatch(/\bCII\b|ciiTitle|Cost Inflation Index/i);
    expect(capitalGainsPage).not.toMatch(/See the stamp duty for the buyer|खरीदार के लिए स्टैंप ड्यूटी देखें/i);
  });
});

describe('loan estimate claims', () => {
  it('does not present model assumptions or old bank figures as lender policy', () => {
    const loan = registry.find((tool) => tool.key === 'loanEligibility')!;
    const loanNav = nav.links.find((link) => link.key === 'site:links.loanEligibility')!;
    const copy = [
      strings([LOAN_PAGE, LOAN_FAQ, LOAN_UI]).join('\n'),
      localeToolText('loanEligibility'),
      loan.name.en,
      loan.desc.en,
      loanNav.desc?.en,
      localeSiteLinkText('loanEligibility'),
    ].join('\n');

    expect(copy).not.toMatch(
      /\bSBI\b|\bHDFC\b|\bICICI\b|\bAxis\b|Bank of Baroda|60 times|40-50%|750|650|75-90%|banks are likely to give|typical figures|अधिकांश बैंक|60 गुना|750 से अधिक|650 से कम|75-90%/i,
    );
    expect(copy).toMatch(/assumption|illustrative|मान्यता|उदाहरण/i);
    expect(copy).toMatch(/not.*(offer|approval|decision)|नहीं.*(ऑफ़र|मंज़ूरी|निर्णय)/i);
  });
});

describe('property checklist claims', () => {
  it('treats its document list as incomplete prompts, not legal review or title verification', () => {
    const checklist = registry.find((tool) => tool.key === 'propertyChecklist')!;
    const copy = [
      strings([CHECKLIST_PAGE, CHECKLIST_FAQ, CHECKLIST_HOWTO, CHECKLIST_UI]).join('\n'),
      localeToolText('propertyChecklist'),
      checklist.name.en,
      checklist.desc.en,
    ].join('\n');

    expect(copy).not.toMatch(
      /\b40\+|verified by 360ghar experts|free and private|essential document checklist|ensure you have all legal papers|property is free of dues|proves the property has a clear title|not legally required|demolition risk|all legal papers|40 से अधिक|360ghar विशेषज्ञों द्वारा सत्यापित|मुफ़्त और निजी|सभी कानूनी कागज़|प्रॉपर्टी का शीर्षक स्पष्ट|प्रॉपर्टी पर कोई बकाया नहीं|ध्वंस का जोखिम/i,
    );
    expect(copy).toMatch(/non-exhaustive|not a legal|does not verify|requirements vary|गैर-सम्पूर्ण|कानूनी.*नहीं|सत्यापित नहीं|ज़रूरतें अलग|आवश्यकताएँ अलग/i);
    expect(checklist.desc.en).toMatch(/13.*non-exhaustive|non-exhaustive.*13/i);
    expect(checklist.desc.en).toMatch(/does not review or verify documents/i);
  });

  it('uses prompt language in navigation and blog links', () => {
    const enNav = enCommon.nav as Record<string, unknown>;
    const hiNav = hiCommon.nav as Record<string, unknown>;
    const copy = [
      enNav.propertyChecklist,
      hiNav.propertyChecklist,
      strings([enBlog, hiBlog]),
      blogToolsSource,
    ].flatMap(strings).join('\n');

    expect(copy).toMatch(/Property document prompts|प्रॉपर्टी दस्तावेज़ संकेत/i);
    expect(copy).not.toMatch(/Property Checklist|प्रॉपर्टी चेकलिस्ट|Papers to check before you pay|भुगतान से पहले जाँचने वाले कागज़/i);
  });
});

describe('EMI tool claims', () => {
  it('limits lender and prepayment claims to the calculator scenario', () => {
    const emi = registry.find((tool) => tool.key === 'emi')!;
    const copy = [
      strings([EMI_FAQ, EMI_HOWTO, EMI_PAGE, EMI_UI]).join('\n'),
      localeToolText('emi'),
      emiPage,
      emi.desc.en,
      emi.desc.hi,
      toolSchemas.emiCalculator.description,
      toolSchemas.emiCalculator.keywords,
    ].join('\n');

    expect(copy).not.toMatch(
      /free EMI|instant(?:ly)?|safe EMI|40% of your monthly income|many advisers suggest|most banks allow|without a penalty|reports the delay to credit bureaus|makes the loan a non-performing asset|CIBIL|SBI home loan|HDFC home loan|मुफ़्त|तुरंत गणना|40% से कम|ज़्यादातर बैंक.*पेनल्टी|क्रेडिट ब्यूरो|NPA बन सकता/i,
    );
    expect(copy).toMatch(/estimate|scenario|inputs|not a lender|lender.*terms|अनुमान|परिदृश्य|दर्ज.*मान|लेंडर.*शर्तें/i);
    expect(emiPage).not.toMatch(/how much loan you can get|आपको कितना लोन मिल सकता/i);
    expect(emiPage).toMatch(/illustrative loan estimate|लोन.*अनुमान/i);
    expect(`${emi.desc.en} ${emi.desc.hi}`).toMatch(/entered values|modeled|दर्ज.*मान|मॉडल/i);
    expect(toolSchemas.emiCalculator.description).toMatch(/not a lender|not.*eligibility|fees.*not included/i);
    expect(toolSchemas.emiCalculator.keywords).not.toMatch(/\bSBI\b|\bHDFC\b/i);
  });
});

describe('homepage financial tool claims', () => {
  it('describes EMI and sale-gain tools within their actual scope', () => {
    const copy = strings([homeCopy.en.toolsets[0], homeCopy.hi.toolsets[0]]).join('\n');

    expect(copy).toMatch(/Estimate an EMI from entered values|दर्ज मानों से EMI का अनुमान/i);
    expect(copy).toMatch(/Property sale gain worksheet|प्रॉपर्टी बिक्री लाभ वर्कशीट/i);
    expect(copy).toMatch(/pre-tax|not a tax estimate|कर-पूर्व|टैक्स.*अनुमान नहीं/i);
    expect(copy).not.toMatch(/Capital gains tax calculator|Estimate tax using the inputs and assumptions shown|कैपिटल गेन टैक्स कैलकुलेटर|दिए गए इनपुट और मान्यताओं से टैक्स का अनुमान/i);
  });
});

describe('localized tool-page links', () => {
  it('imports the locale path helper used by the fake-listing page', () => {
    expect(fakeListingPage).toMatch(/import \{ localizePath \} from '@\/lib\/i18n\/locale';/);
    expect(fakeListingPage).toContain("localizePath('/property-document-checklist', locale)");
  });
});

describe('AI design claims', () => {
  it('does not promise price, sign-up, generation time, photo quality, or layout retention', () => {
    const copy = [
      localeToolText('aiDesignStudio'),
      strings([AID_PAGE, AID_FAQ, AID_HOWTO, AID_UI]).join('\n'),
    ].join('\n');
    expect(copy).not.toMatch(
      /\bfree\b|no sign-up|no account|about half a minute|under a minute|in seconds|about 10 designs|photorealistic|8K resolution|keeps the layout|keeps the room layout|मुफ़्त|मुफ्त|साइन.?अप नहीं|एक मिनट से कम|आधे मिनट|सेकंड में|फोटोरियलिस्टिक|असली जैसे|ढाँचा वही रखता/i,
    );
  });
});

describe('Vastu tool claims', () => {
  it('does not promise free or instant compliance, science, or remedies', () => {
    const copy = [localeToolText('vastu'), strings([VASTU_PAGE, VASTU_UI]).join('\n')].join('\n');
    expect(copy).not.toMatch(
      /\bfree\b|no sign-up|instant(?:ly)?|under a minute|compliance score|compliance report|compliant and non-compliant|align with environmental science|brings prosperity|for health and wealth|corrected with remedies|मुफ़्त|मुफ्त|साइन.?अप नहीं|तुरंत|एक मिनट से कम|अनुपालन स्कोर|अनुपालन रिपोर्ट|अनुपालित और गैर-अनुपालित|समृद्धि लाता|स्वास्थ्य और धन|वैज्ञानिक.*मेल|दोष.*ठीक/i,
    );
    expect(copy).toMatch(/not an official|not a scientific|not a legal|आधिकारिक.*नहीं|वैज्ञानिक.*नहीं|कानूनी.*नहीं/i);
  });

  it('labels generated room findings as tool output, not verified conditions', () => {
    const labels = strings([
      VASTU_UI.en.statuses,
      VASTU_UI.hi.statuses,
      VASTU_UI.en.severityLabel,
      VASTU_UI.hi.severityLabel,
      VASTU_UI.en.fix,
      VASTU_UI.hi.fix,
      VASTU_UI.en.none,
      VASTU_UI.hi.none,
      VASTU_UI.en.statGood,
      VASTU_UI.hi.statGood,
      VASTU_UI.en.statAttention,
      VASTU_UI.hi.statAttention,
      VASTU_UI.en.statDefects,
      VASTU_UI.hi.statDefects,
    ]).join('\n');
    expect(labels).not.toMatch(/\bExcellent\b|\bGood\b|Working well|Need attention|Defects found|What to do|None found|बहुत अच्छा|अच्छा|ठीक हैं|ध्यान चाहिए|दोष मिले|क्या करें|कुछ नहीं मिला/i);
    expect(labels).toMatch(/tool|flag|टूल|फ़्लैग/i);
  });

  it('shows a fixed caveat before backend-generated results', () => {
    const caveats = [VASTU_UI.en, VASTU_UI.hi]
      .map((copy) => (copy as unknown as Record<string, string>).resultCaveat ?? '')
      .join('\n');

    expect(caveats).toMatch(/generated from the uploaded image|tool.s rule set|may be wrong|not.*assessment/i);
    expect(caveats).toMatch(/टूल.*इमेज|गलत.*हो सकती|वैज्ञानिक.*नहीं|कानूनी.*नहीं/i);
    expect(vastuCheckerPage).toContain('t.resultCaveat');
    expect(vastuCheckerPage.indexOf('t.resultCaveat')).toBeLessThan(vastuCheckerPage.indexOf('id="vastu-score"'));
  });
});

describe('floor planner claims', () => {
  it('does not promise free access, building-code fit, or construction-ready measurements', () => {
    const copy = [localeToolText('designBlueprint'), strings([BP_PAGE, BP_FAQ, BP_HOWTO]).join('\n')].join('\n');
    expect(copy).not.toMatch(
      /\bfree\b|no sign-up|no account|no charges|no paid tiers|free planner|fits the land|local building bylaws|cuts the need for air conditioning|check sizes from any angle|मुफ़्त|मुफ्त|बिना साइन.?अप|कोई शुल्क नहीं|पेड प्लान नहीं|बिल्डिंग नियमों.*फ़िट|AC की ज़रूरत कम|हर कोण से.*नाप/i,
    );
    expect(copy).toMatch(/not an approved|not.*construction|निर्माण.*प्लान नहीं|निर्माण के लिए नहीं/i);
  });
});
