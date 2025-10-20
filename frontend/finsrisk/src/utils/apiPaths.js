export const BASE_URL = "http://localhost:5001";

export const API_PATHS = {
    AUTH: {
        REGISTER: "api/users/register",
        LOGIN: "api/users/login"
    },
    PORTFOLIO: {
        GET_ALL: "api/portfolios",
        GET_ONE: (id) => `api/portfolios/${id}`,
        CREATE: "api/portfolios",
        UPDATE: (id) => `api/portfolios/${id}`,
        DELETE: (id) => `api/portfolios/${id}`,
        SUMMARY: (id) => `api/portfolios/${id}/summary`,
        VALUE: (id) => `api/portfolios/${id}/value`
    },
    VAR: {
        RUN: (portfolioId) => `api/portfolios/${portfolioId}/var`,
        GET_ONE: (portfolioId, runId) => `api/portfolios/${portfolioId}/var/${runId}`,
    },
    MARKET: {
        LATEST: (symbol) => `api/market/latest/${symbol}`,
        HISTORY: (symbol) => `api/market/history/${symbol}`
    },
    DASHBOARD: {
        OVERVIEW: "api/dashboard"
    }
}