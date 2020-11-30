import { enableFetchMocks } from "jest-fetch-mock";
enableFetchMocks();

import * as SmartFetch from "..";

const { smartFetch, RequestMethods } = SmartFetch;

describe("SmartFetch no DOM", () => {
  it("still functions without breaking", async () => {
    const res = await smartFetch(RequestMethods.GET, "/");
    expect(true);
  });
});
