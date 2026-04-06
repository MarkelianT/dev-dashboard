import { useEffect, useState } from "react";
import { fetchJson } from "../lib/fetchJson";

type NewsItem = {
  title: string;
  link: string;
  pubDate: string;
};
type RssResponse = {
  items?: NewsItem[];
};

function TechNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const norwegianTechFeeds = [
      "https://www.digi.no/rss",
      "https://www.tu.no/feeds/general.xml",
    ];

    const loadNews = async () => {
      for (const feed of norwegianTechFeeds) {
        try {
          const rssUrl = encodeURIComponent(feed);
          const api = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;
          const data = await fetchJson<RssResponse>(api);

          if (Array.isArray(data.items) && data.items.length > 0) {
            setNews(data.items.slice(0, 5));
            setLoading(false);
            return;
          }
        } catch {
          // Try next feed source
        }
      }

      setError("No tech headlines available.");
      setLoading(false);
    };

    loadNews();
  }, []);

  return (
    <div className="panel h-auto">
      <h2 className="panel-title">Tech News</h2>

      {loading && <p className="panel-muted mt-4">Loading headlines...</p>}

      {!loading && news.length === 0 && <p className="panel-muted mt-4">{error}</p>}

      <ul className="mt-4 space-y-3">
        {news.map((item, index) => (
          <li key={index} className="panel-sub">
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="accent-link text-sm font-medium"
            >
              {item.title}
            </a>
            <p className="mt-1 text-xs text-muted">
              {new Date(item.pubDate).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TechNews;
