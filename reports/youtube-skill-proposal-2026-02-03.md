# YouTube Skill Ecosystem Analysis & "youtube-research-pro" Proposal

**Date:** 2026-02-03  
**Author:** OpenClaw Subagent  
**Status:** Research Complete

---

## Executive Summary

This report analyzes the current YouTube skill ecosystem across MCP servers, identifies feature gaps, and proposes an ultimate "youtube-research-pro" skill that amalgamates the best capabilities from all discovered tools.

**Key Finding:** There are 15+ YouTube MCP servers available, each with different strengths. No single solution covers all needs. The proposed "youtube-research-pro" skill would combine transcript extraction, video download, batch operations, analytics, and research workflows into one comprehensive tool.

---

## Part 1: Ecosystem Survey Results

### 1.1 MCP Transcript Servers (Transcript-Focused)

| Server | Stars | Language | Key Features |
|--------|-------|----------|--------------|
| **kimtaeyoon83/mcp-server-youtube-transcript** | 463 ⭐ | TypeScript | Multi-language, timestamps, ad filtering, YouTube Shorts support |
| **jkawamoto/mcp-youtube-transcript** | 293 ⭐ | Python | Pagination for long transcripts, video metadata, proxy support |
| **egoist/fetch-mcp** | 157 ⭐ | TypeScript | URL fetching + YouTube transcripts, SSE/HTTP server modes |
| **cottongeeks/ytt-mcp** | 72 ⭐ | Python | Simple transcript extraction |
| **mybuddymichael/youtube-transcript-mcp** | 61 ⭐ | TypeScript | Clean implementation |
| **adhikasp/mcp-youtube** | 45 ⭐ | Python | Timestamps, simple API |

### 1.2 Download/yt-dlp Servers

| Server | Stars | Language | Key Features |
|--------|-------|----------|--------------|
| **kevinwatt/yt-dlp-mcp** | 211 ⭐ | TypeScript | Full yt-dlp integration, search, download video/audio, subtitles, metadata, trimming |
| **Knuckles-Team/media-downloader** | 5 ⭐ | Python | A2A + MCP server, multi-platform downloads |
| **yorickchan/mcp_youtube_dlp** | 4 ⭐ | Python | Basic yt-dlp download |

### 1.3 YouTube Data API Servers (Full API Access)

| Server | Stars | Language | Key Features |
|--------|-------|----------|--------------|
| **ShellyDeng08/youtube-connector-mcp** | 10 ⭐ | Python | Search, transcripts, comments, channel analytics, YouTube Data API v3 |
| **dannySubsense/youtube-mcp-server** | 9 ⭐ | Python | **14 functions!** Video details, transcripts, comments, engagement analysis, knowledge base evaluation, tech freshness scoring |
| **kirbah/mcp-youtube** | 9 ⭐ | TypeScript | Token-optimized, MongoDB caching, outlier channel detection, batch operations |

### 1.4 Specialized Servers

| Server | Features |
|--------|----------|
| **IA-Programming/Youtube-MCP** | Vector database integration, semantic search over transcripts |
| **supadata-ai/mcp** | Multi-platform transcripts (YouTube, TikTok, Instagram, Twitter), web scraping |

---

## Part 2: Feature Comparison Matrix

### Legend
- ✅ = Fully supported
- 🟡 = Partial/Limited
- ❌ = Not supported
- 🔄 = Requires external dependency

| Feature | Our Skill (OpenClaw) | kimtaeyoon83 | jkawamoto | kevinwatt (yt-dlp) | ShellyDeng08 | dannySubsense | kirbah | supadata |
|---------|---------------------|--------------|-----------|-------------------|--------------|---------------|--------|----------|
| **Search** |
| Video Search | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Filter by date | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Pagination | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Transcripts** |
| Auto-generated | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manual captions | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Multi-language | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Timestamps | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ad filtering | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Long transcript pagination | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Download** |
| Video download | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Audio extraction | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Resolution control | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Video trimming | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Subtitles download | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Analytics** |
| View/like counts | ✅ | ❌ | 🟡 | ✅ | ✅ | ✅ | ✅ | ❌ |
| Engagement analysis | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Channel statistics | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Trending videos | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| **Comments** |
| Fetch comments | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Comment replies | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| **Advanced** |
| Batch operations | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Token optimization | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Caching (MongoDB) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Semantic search | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Knowledge base eval | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Tech freshness scoring | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Multi-platform | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Infrastructure** |
| Rate limiting | 🟡 | ❌ | ❌ | ❌ | 🟡 | ❌ | ✅ | ✅ |
| Proxy support | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Cookie auth | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Part 3: Proposed "youtube-research-pro" Skill

### 3.1 Vision

An all-in-one YouTube research skill that enables:
1. **Deep video research** - Extract all available data from any video
2. **Batch processing** - Process 10-100 videos efficiently
3. **Research workflows** - Built-in patterns for common research tasks
4. **Intelligent caching** - Minimize API costs and rate limits

### 3.2 SKILL.md Template

```yaml
# youtube-research-pro Skill

## Overview
Comprehensive YouTube research skill combining transcript extraction, 
metadata retrieval, batch processing, and research workflows.

## Tools

### Core Tools (Tier 1 - Always Available)

#### youtube_search
Search YouTube videos with advanced filters.
- query: string (required)
- maxResults: number (default: 10, max: 50)
- order: relevance | date | viewCount | rating
- publishedAfter: ISO date
- publishedBefore: ISO date
- duration: short (<4min) | medium (4-20min) | long (>20min)
- type: video | channel | playlist

#### youtube_video_details
Get comprehensive video metadata.
- videoId: string | string[] (batch mode)
- fields: title | description | statistics | contentDetails | all

#### youtube_transcript
Extract video transcript/captions.
- videoId: string | string[]
- language: string (default: "en", fallback: auto-detect)
- format: text | timestamped | segments
- stripAds: boolean (default: true)
- maxChars: number (for pagination)

#### youtube_channel_info
Get channel statistics and metadata.
- channelId: string | string[]
- includeRecentVideos: boolean (default: false)
- recentVideoCount: number (default: 5)

### Extended Tools (Tier 2 - API Key Required)

#### youtube_comments
Fetch video comments with threading.
- videoId: string
- maxResults: number (default: 20, max: 100)
- order: relevance | time
- includeReplies: boolean (default: false)
- maxReplies: number (default: 3)

#### youtube_trending
Get trending videos by region/category.
- regionCode: string (default: "US")
- categoryId: string (optional)
- maxResults: number (default: 10)

#### youtube_playlists
List and retrieve playlist contents.
- playlistId: string
- maxResults: number (default: 50)

### Research Workflows (Tier 3 - Composite Tools)

#### youtube_summarize_video
One-shot video summary combining transcript + metadata.
- videoId: string
- summaryLength: brief | detailed | comprehensive
Returns: title, channel, duration, key points, transcript summary

#### youtube_research_topic
Multi-video topic research.
- query: string
- videoCount: number (default: 5, max: 20)
- extractTranscripts: boolean (default: true)
- analyzeEngagement: boolean (default: true)
Returns: videos[], common themes, key points, engagement analysis

#### youtube_compare_channels
Compare multiple channels.
- channelIds: string[]
- metrics: subscribers | views | uploads | engagement
- timeRange: week | month | year
Returns: comparison table, trends, recommendations

#### youtube_playlist_summary
Summarize entire playlist content.
- playlistId: string
- includeTranscripts: boolean (default: true)
Returns: video summaries, common themes, learning path

### Download Tools (Tier 4 - yt-dlp Required)

#### youtube_download_video
Download video with options.
- videoId: string
- resolution: 480p | 720p | 1080p | best
- outputPath: string (default: ~/Downloads)
- startTime: string (HH:MM:SS)
- endTime: string (HH:MM:SS)

#### youtube_download_audio
Extract audio only.
- videoId: string
- format: mp3 | m4a | best
- outputPath: string

#### youtube_download_subtitles
Download subtitle files.
- videoId: string
- language: string (default: "en")
- format: vtt | srt

## Configuration

### Required
- YOUTUBE_API_KEY: YouTube Data API v3 key

### Optional
- YOUTUBE_QUOTA_DAILY: Daily quota limit (default: 10000)
- YOUTUBE_CACHE_DIR: Cache directory for responses
- YOUTUBE_CACHE_TTL: Cache time-to-live in hours (default: 24)
- YTDLP_PATH: Path to yt-dlp binary (auto-detect)
- YTDLP_COOKIES_BROWSER: Browser for cookie extraction

## Rate Limiting Strategy

| Tool Type | Quota Cost | Rate Limit |
|-----------|------------|------------|
| search | 100 units | 10/min |
| video_details | 1 unit | 100/min |
| transcript | 0 units* | 60/min |
| comments | 1 unit | 50/min |
| channel_info | 1-3 units | 50/min |

*Transcripts use youtube-transcript-api, not YouTube Data API

## Batch Processing Limits

- Maximum videos per batch: 50
- Maximum concurrent transcript fetches: 10
- Recommended batch size for research: 10-20 videos
- Queue management: FIFO with priority for API-free operations

## Dependencies

### Required
- youtube-transcript-api (Python) or equivalent
- YouTube Data API v3 access

### Optional
- yt-dlp (for download features)
- MongoDB (for caching/analytics)
```

### 3.3 Implementation Architecture

```
youtube-research-pro/
├── SKILL.md
├── config.yaml
├── src/
│   ├── api/
│   │   ├── youtube_data_api.py    # YouTube Data API v3 wrapper
│   │   ├── transcript_api.py       # youtube-transcript-api wrapper
│   │   └── ytdlp_wrapper.py        # yt-dlp integration
│   ├── tools/
│   │   ├── search.py
│   │   ├── video_details.py
│   │   ├── transcript.py
│   │   ├── channel.py
│   │   ├── comments.py
│   │   ├── download.py
│   │   └── workflows/
│   │       ├── summarize.py
│   │       ├── research_topic.py
│   │       ├── compare_channels.py
│   │       └── playlist_summary.py
│   ├── cache/
│   │   ├── file_cache.py          # File-based caching
│   │   └── mongo_cache.py         # MongoDB caching (optional)
│   ├── rate_limiter.py
│   └── quota_tracker.py
├── tests/
└── requirements.txt
```

### 3.4 Key Design Decisions

#### Transcript Extraction Strategy
1. **Primary**: youtube-transcript-api (Python) - No API quota cost
2. **Fallback**: yt-dlp subtitle extraction
3. **Last resort**: YouTube Data API captions (high quota cost)

#### Batch Processing Strategy
1. **Parallel execution** for independent requests
2. **Rate limiting** per-endpoint with exponential backoff
3. **Quota tracking** with daily reset
4. **Priority queue** - API-free operations first

#### Caching Strategy
1. **File cache** (default) - JSON files in ~/.cache/youtube-research-pro/
2. **MongoDB cache** (optional) - For high-volume usage
3. **TTL-based invalidation** - 24h for transcripts, 1h for trending

---

## Part 4: Implementation Roadmap

### Phase 1: Core Foundation (Week 1-2)
- [ ] Set up skill structure
- [ ] Implement YouTube Data API wrapper
- [ ] Implement transcript extraction (youtube-transcript-api)
- [ ] Basic caching layer
- [ ] Rate limiting
- [ ] Core tools: search, video_details, transcript

### Phase 2: Extended Features (Week 3-4)
- [ ] Comments retrieval
- [ ] Channel statistics
- [ ] Trending videos
- [ ] Playlist operations
- [ ] Batch processing support

### Phase 3: Research Workflows (Week 5-6)
- [ ] youtube_summarize_video workflow
- [ ] youtube_research_topic workflow
- [ ] youtube_compare_channels workflow
- [ ] youtube_playlist_summary workflow

### Phase 4: Download Integration (Week 7-8)
- [ ] yt-dlp integration
- [ ] Video download with trimming
- [ ] Audio extraction
- [ ] Subtitle download

### Phase 5: Polish & Optimization (Week 9-10)
- [ ] MongoDB caching option
- [ ] Quota optimization
- [ ] Documentation
- [ ] Testing suite
- [ ] Performance benchmarks

---

## Part 5: Dependencies List

### Required Dependencies
```
# Python packages
youtube-transcript-api>=0.6.0     # Transcript extraction (no API cost)
google-api-python-client>=2.0.0   # YouTube Data API v3
httpx>=0.25.0                     # Async HTTP client
pydantic>=2.0.0                   # Data validation

# Optional but recommended
yt-dlp>=2024.0.0                  # Video/audio download
pymongo>=4.0.0                    # MongoDB caching
```

### System Dependencies
```
# For yt-dlp functionality
ffmpeg                            # Audio/video processing

# For deno (required for some yt-dlp features with cookies)
deno                              # JavaScript runtime
```

### API Requirements
- YouTube Data API v3 key (free tier: 10,000 units/day)
- No API key needed for transcript extraction

---

## Part 6: Recommendations

### Immediate Actions
1. **Integrate kimtaeyoon83's transcript server** - Most mature, best features
2. **Add yt-dlp for downloads** - Essential for offline research
3. **Implement batch operations** - Critical for research workflows

### Future Considerations
1. **Vector database integration** - For semantic search over transcripts
2. **Multi-platform support** - TikTok, Vimeo, etc. via supadata or yt-dlp
3. **AI-powered analysis** - Automatic summarization, key point extraction

### Cost Optimization
- Use transcript API (free) before YouTube Data API
- Cache aggressively (24h for most content)
- Batch video details requests (up to 50 per call = 1 unit)
- Monitor quota usage with alerts at 80%

---

## Appendix A: API Quota Reference

| Operation | Quota Cost |
|-----------|------------|
| search.list | 100 |
| videos.list | 1 |
| channels.list | 1-3 |
| playlists.list | 1 |
| playlistItems.list | 1 |
| commentThreads.list | 1 |
| comments.list | 1 |
| captions.list | 50 |
| captions.download | 200 |

**Daily quota (free tier):** 10,000 units

---

## Appendix B: Discovered GitHub Repositories

### Transcript-Focused
- https://github.com/kimtaeyoon83/mcp-server-youtube-transcript
- https://github.com/jkawamoto/mcp-youtube-transcript
- https://github.com/adhikasp/mcp-youtube
- https://github.com/egoist/fetch-mcp
- https://github.com/cottongeeks/ytt-mcp
- https://github.com/mybuddymichael/youtube-transcript-mcp

### Download-Focused
- https://github.com/kevinwatt/yt-dlp-mcp
- https://github.com/yorickchan/mcp_youtube_dlp
- https://github.com/Knuckles-Team/media-downloader

### Full API Access
- https://github.com/ShellyDeng08/youtube-connector-mcp
- https://github.com/dannySubsense/youtube-mcp-server
- https://github.com/kirbah/mcp-youtube
- https://github.com/GeLi2001/youtube-mcp

### Specialized
- https://github.com/IA-Programming/Youtube-MCP (vector search)
- https://github.com/supadata-ai/mcp (multi-platform)

---

*Report generated by OpenClaw subagent on 2026-02-03*
