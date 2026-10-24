/**
 * RERA project-intelligence shapes for `/api/v1/data-hub`, taken from the generated
 * backend contract (`src/lib/api/schema.d.ts`). Do not write DTOs by hand: run
 * `pnpm api:sync && pnpm api:types` after the backend spec changes.
 *
 * Field names are the wire names, verbatim: do not rename them here.
 *
 * Two fields are deliberately absent from the API and must not be invented:
 * a person's contact details, and a bank account number.
 */
import type { components, operations } from '@/lib/api/schema';

type S = components['schemas'];

/** A source behind a number. Mirrors the data hub's public-safe provenance record. */
export type ProjectSource = S['DataHubProvenanceSource'];

/** Source metadata and the explicit verification status of a record. */
export type ProjectProvenance = S['DataHubProvenanceSummary'];

/** One row of a project list, a map, a developer's portfolio or a watchlist. */
export type ProjectSummary = S['ProjectSummaryResponse'];

/** One land-use head: how much of the plot is residential, commercial, open, and so on. */
export type LandUsage = S['LandUsageResponse'];

/** The declared cost of the project, in rupees. */
export type ProjectCost = S['ProjectCostResponse'];

/** Money spent in one quarter, under one head. */
export type QuarterlyExpenditure = S['QuarterlyExpenditureResponse'];

/** A document in the project's filing vault. */
export type ProjectDocument = S['ProjectDocumentResponse'];

/** Statutory approvals and the utilities the project is cleared for. */
export type StatutoryApproval = S['StatutoryApprovalResponse'];

/** One facility promised by the project, with its stated cost and status. */
export type Facility = S['FacilityResponse'];

/** One approval a facility needs, and the agency that grants it. */
export type Noc = S['NocResponse'];

/** A person on the project. The API exposes no contact details. */
export type ProjectPerson = S['ProjectPersonResponse'];

/** The project's escrow bank. The API exposes no account number. */
export type BankAccount = S['BankAccountResponse'];

/** One unit type of the project. */
export type UnitConfig = S['UnitConfigResponse'];

/** One line of the construction specification sheet. */
export type Specification = S['SpecificationResponse'];

/** One price observation. `source` says whether it was declared at launch, filed, or derived. */
export type PricePoint = S['PricePointResponse'];

/** The project's registration profile: the numbers from the RERA filing itself. */
export type ProjectProfile = S['ProjectProfileResponse'];

/** One question and its answer, as filed with the authority. */
export type ProjectFaqItem = S['FaqItemResponse'];

/** The FAQ response envelope. */
export type ProjectFaqList = S['ProjectFaqResponse'];

/** A project with every sub-record the detail route returns. */
export type ProjectDetail = S['ProjectDetailResponse'];

/** One developer row in a list. */
export type DeveloperSummary = S['DeveloperSummaryResponse'];

/** The five pillars of a developer score, and the counts behind it. */
export type DeveloperScore = S['DeveloperScoreResponse'];

/** A developer with the dossier and the score behind it. */
export type DeveloperDetail = S['DeveloperDetailResponse'];

/** One micro-market: a sub-district the price data is grouped by. */
export type MicroMarket = S['MicroMarketResponse'];

/**
 * A micro-market with its price level and stage mix. `stage_breakdown` is a map of
 * stage name to project count, not a list of rows.
 */
export type MicroMarketDetail = S['MicroMarketDetailResponse'];

/** One city's reading for one day. */
export type MarketPulse = S['MarketPulseResponse'];

/** A project as a point on a map. */
export type ProjectMapPoint = S['ProjectMapPointResponse'];

/** A saved project. `alert_prefs` is free-form and is shown as stored. */
export type WatchlistItem = S['WatchlistItemResponse'];

/** A cursor page of project rows, the shape `/projects` returns. */
export type ProjectPage = S['CursorPage_ProjectSummaryResponse_'];

/** A cursor page of developer rows, the shape `/developers` returns. */
export type DeveloperPage = S['CursorPage_DeveloperSummaryResponse_'];

/** The bounding box `/map/projects` is queried with: the route's own four query keys. */
export type MapBounds = NonNullable<operations['list_map_projects_api_v1_data_hub_map_projects_get']['parameters']['query']>;
