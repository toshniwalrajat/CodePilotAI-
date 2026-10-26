
import api from "./api";

const codeAnalysisService = {
  async analyzeCode(request) {
    const response = await api.post(
      "/api/analysis/explain",
      request
    );

    return response.data;
  },
};

export default codeAnalysisService;
