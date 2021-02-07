import { extractSearchParam } from "../util/search-params";

export const isMobile = extractSearchParam("mobile") === "1";
