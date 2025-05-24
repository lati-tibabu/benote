import React, { useEffect, useState } from "react";

const News = () => {
  const [newsArticles, setNewsArticles] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      const today = new Date().toISOString().split("T")[0];
      try {
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=education&to=${today}&sortBy=publishedAt&pageSize=6&apiKey=2616a4352d3e4fb0a2b868913fa9929f`
        );
        const data = await response.json();
        setNewsArticles(data.articles || []);
      } catch (error) {
        console.error("Error fetching news articles:", error);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">
        📚 Latest Education News
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {newsArticles.map((article, index) => (
          <div
            key={index}
            className="border rounded-xl p-4 shadow hover:shadow-lg transition duration-300 bg-gray-50"
          >
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-medium text-blue-600 hover:underline"
            >
              {article.title}
            </a>
            <p className="text-sm text-gray-600 mt-2 line-clamp-3">
              {article.description}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(article.publishedAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default News;
