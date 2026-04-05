import { useEffect, useState } from "react";

type NewsItem = {
  title: string;
  link: string;
  pubDate: string;
};

function TechNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rssUrl = encodeURIComponent("https://www.nrk.no/toppsaker.rss");
    const api = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;

    fetch(api)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);

        if (data.items) {
          setNews(data.items.slice(0, 5));
        }

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ border: "1px solid #ddd", padding: "20px" }}>
      <h2>Tech News</h2>

      {loading && <p>Loading...</p>}

      {!loading && news.length === 0 && <p>No news available.</p>}

      <ul style={{ paddingLeft: "20px" }}>
        {news.map((item, index) => (
          <li key={index} style={{ marginBottom: "10px" }}>
            <a href={item.link} target="_blank" rel="noreferrer">
              {item.title}
            </a>
            <br />
            <small>{new Date(item.pubDate).toLocaleDateString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TechNews;