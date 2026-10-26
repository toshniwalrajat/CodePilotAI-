
import api from "./api";

const githubAnalysisService = {
  async analyzeRepository(repositoryUrl, analysisType) {
    const response = await api.post("/api/analysis/github", {
      repositoryUrl,
      analysisType,
    });

    return response.data;
  },
};

export default githubAnalysisService;
