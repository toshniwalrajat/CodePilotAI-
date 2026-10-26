import api from "./api";

const repositoryAnalysisService = {
  async analyzeRepository(file, analysisType) {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("analysisType", analysisType);

    const response = await api.post(
      "/api/analysis/repository",
      formData
    );

    return response.data;
  },
};

export default repositoryAnalysisService;