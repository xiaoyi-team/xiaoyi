import { ApiError, apiRequest } from "../../api/client";
import { isValidSignInDate } from "./sign-in-dates";
import type { SignInQuote } from "./sign-in-quote";

export interface SignInAddResponse {
  msg: string;
  sign_date: string;
  total_days: number;
  continue_days: number;
  biz_code: string | null;
  quote_status: "ready" | "pending";
  quote: SignInQuote | null;
}

export type SignInAddContractErrorReason = "invalid-json" | "invalid-response" | "unknown-biz-code";

// A response contract error does not prove that the server failed to save the sign-in.
export class SignInAddContractError extends Error {
  readonly reason: SignInAddContractErrorReason;
  readonly data: unknown;

  constructor(message: string, reason: SignInAddContractErrorReason, data: unknown, cause?: unknown) {
    super(message, { cause });
    this.name = "SignInAddContractError";
    this.reason = reason;
    this.data = data;
  }
}

export class SignInAddAbortError extends Error {
  constructor(cause: unknown) {
    super("签到请求已取消；取消不代表服务端未保存签到。", { cause });
    this.name = "AbortError";
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

/** Pure validation: no requests, cache updates, or pending fallbacks. */
export function parseSignInAddResponse(response: unknown): SignInAddResponse {
  const invalid = (message: string): never => {
    throw new SignInAddContractError(message, "invalid-response", response);
  };
  if (!isObject(response)) return invalid("签到响应必须为对象。");

  const fields = ["msg", "sign_date", "total_days", "continue_days", "biz_code", "quote_status", "quote"];
  if (!fields.every((field) => Object.hasOwn(response, field))) {
    return invalid("签到响应缺少必返字段。");
  }
  const { msg, sign_date, total_days, continue_days, biz_code, quote_status, quote } = response;
  if (!isNonEmptyString(msg) || typeof sign_date !== "string" || !isValidSignInDate(sign_date) ||
    !isInteger(total_days) || !isInteger(continue_days)) {
    return invalid("签到响应的提示、日期或统计字段不正确。");
  }
  if (biz_code !== null && !isNonEmptyString(biz_code)) {
    return invalid("签到响应的业务码必须为非空字符串或null。");
  }
  if (biz_code !== null && biz_code !== "SIGN_001") {
    throw new SignInAddContractError("签到响应包含未知业务码，需核实签到结果。", "unknown-biz-code", response);
  }
  if (quote_status !== "ready" && quote_status !== "pending") {
    return invalid("签到响应的语录状态不正确。");
  }

  let parsedQuote: SignInQuote | null = null;
  if (quote_status === "pending") {
    if (quote !== null) return invalid("待获取语录的签到响应必须返回quote:null。");
  } else {
    if (!isObject(quote) || !["id", "content", "quote_date"].every((field) => Object.hasOwn(quote, field)) ||
      !isInteger(quote.id) || !isNonEmptyString(quote.content) || typeof quote.quote_date !== "string" ||
      !isValidSignInDate(quote.quote_date) || quote.quote_date !== sign_date) {
      return invalid("签到响应的语录字段或业务日期不正确。");
    }
    parsedQuote = { id: quote.id, content: quote.content, quote_date: quote.quote_date };
  }
  return { msg, sign_date, total_days, continue_days, biz_code, quote_status, quote: parsedQuote };
}

/** No query parameters or request body; authentication is owned by apiRequest. */
export async function addSignIn(signal: AbortSignal): Promise<SignInAddResponse> {
  let response: unknown;
  try {
    signal.throwIfAborted();
    response = await apiRequest<unknown>("/api/sign/add", { baseUrl: "", method: "POST", signal, responseType: "json" });
  } catch (error) {
    // The shared client wraps fetch aborts as status 0. Preserve HTTP errors unchanged.
    if (signal.aborted && (!(error instanceof ApiError) || error.status === 0)) {
      throw new SignInAddAbortError(error);
    }
    if (error instanceof ApiError && error.status >= 200 && error.status < 300) {
      throw new SignInAddContractError("签到响应不是有效JSON，需核实签到结果。", "invalid-json", error.data, error);
    }
    // Network/CORS failures retain status 0; HTTP failures retain status and body.
    // Neither aborts nor connection failures are safe grounds for retrying a POST.
    throw error;
  }
  return parseSignInAddResponse(response);
}
