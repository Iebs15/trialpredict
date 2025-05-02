import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Clock } from "lucide-react"

export default function NewsList({ articles = [] }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📰 News</h2>

      {articles.length === 0 ? (
        <p className="text-muted-foreground">No news articles available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article, idx) => (
            <Card key={idx} className="h-full flex flex-col">
              <CardContent className="p-4 space-y-3 flex flex-col h-full">
                {/* Title with link */}
                <div className="text-md font-semibold leading-snug line-clamp-2">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center gap-1"
                  >
                    {article.title}
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                </div>

                {/* Published date */}
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {article.description}
                </p>

                {/* Source */}
                <div className="mt-auto">
                  <Badge variant="outline">
                    {article.source?.name || "Unknown Source"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
