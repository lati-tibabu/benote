import React, { useEffect, useState } from "react";

const categories = ["education", "technology", "science", "health", "career"];

const News = () => {
  const [selectedCategory, setSelectedCategory] = useState("education");
  const [newsArticles, setNewsArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;

  const fetchNews = async (query) => {
    setIsLoading(true);
    const today = new Date().toISOString().split("T")[0];
    try {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${query}&to=${today}&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`
      );
      const data = await response.json();
      setNewsArticles(data.articles || []);
    } catch (error) {
      console.error(`Error fetching news for query: ${query}`, error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(selectedCategory);
  }, [selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchNews(searchQuery);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 bg-white shadow-lg rounded-3xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          📰 Explore News
        </h1>
        <p className="text-gray-600 text-sm">
          Stay updated with the latest in Education, Tech, Science & more.
        </p>
      </header>

      <nav className="flex flex-wrap gap-3 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`capitalize px-4 py-2 rounded-full transition font-medium text-sm shadow-sm ${
              selectedCategory === category
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            {category}
          </button>
        ))}
      </nav>

      <form
        onSubmit={handleSearch}
        className="mb-10 flex flex-col sm:flex-row gap-4"
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for specific news..."
          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          Search
        </button>
      </form>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 border-b pb-2">
          {searchQuery
            ? `Search Results for "${searchQuery}"`
            : `${
                selectedCategory.charAt(0).toUpperCase() +
                selectedCategory.slice(1)
              } News`}
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="p-4 bg-gray-100 rounded-xl animate-pulse space-y-3"
              >
                <div className="h-5 w-3/4 bg-gray-300 rounded"></div>
                <div className="h-4 w-full bg-gray-300 rounded"></div>
                <div className="h-3 w-5/6 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsArticles.length > 0 ? (
              newsArticles.map((article, idx) => (
                <article
                  key={idx}
                  className="bg-gray-50 rounded-xl shadow-md hover:shadow-xl transition p-4 flex flex-col justify-between"
                >
                  {article.urlToImage && (
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      className="rounded-lg mb-3 object-cover h-40 w-full"
                    />
                  )}
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold text-blue-700 hover:underline"
                  >
                    {article.title}
                  </a>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                    {article.description}
                  </p>
                  <time className="text-xs text-gray-400 mt-3">
                    {new Date(article.publishedAt).toLocaleString()}
                  </time>
                </article>
              ))
            ) : (
              <p className="text-gray-500 col-span-full text-center">
                No articles found.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default News;
