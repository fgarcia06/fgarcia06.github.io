# MongoDB Twitter Dataset CLI

**Course:** CMPUT 291 — Introduction to File and Database Management, Fall 2023  
**Team:** Francis Garcia (fgarcia), Ayra Qutub (aqutub), Ruchali Aery (ruchali), Cejiro Roque (cejirohe)  
**Language:** Python 3  
**Database:** MongoDB (NoSQL document store)

---

## What This Project Is About

Project 2 is a command-line application that loads a real-world Twitter/X dataset (scraped tweets in JSONL format) into a MongoDB collection and exposes five operations through an interactive menu. The core challenge is working with a large, nested, unstructured JSON document dataset using a document-oriented database — in contrast to the relational SQL databases from Project 1.

The user starts the program, provides a JSONL file path and a MongoDB port, and gets a menu:

```
1. Search for Tweets
2. Search for Users
3. Compose a Tweet
4. List Tweets
5. List Users
6. Exit
```

Each option is a distinct MongoDB query workload with its own indexing strategy and result presentation.

---

## Hardware / Runtime Components

| Component | Role |
|-----------|------|
| Python 3 | Application runtime |
| `pymongo` | MongoDB driver — connects, queries, inserts, indexes |
| MongoDB | NoSQL document store, running locally on a user-specified port |
| `concurrent.futures.ThreadPoolExecutor` | Parallel batch loading during JSON ingestion |
| JSONL tweet file | Input dataset — one JSON tweet document per line |

---

## Architecture

```
main.py
  │
  ├── Startup
  │     validate json file path exists
  │     accept mongo_port from user
  │     load_json(json_file, mongo_port)
  │           └── MongoClient(localhost:port)
  │               drop + recreate '291db'.'tweets'
  │               ThreadPoolExecutor (4 workers)
  │                   json_file_batcher() → 1000-doc batches
  │                   insert_batch() → collection.insert_many()
  │
  └── Menu Loop
        │
        ├─ [1] search_tweets(mongo_port)
        │         create TEXT index on 'content'
        │         prompt: space-separated keywords
        │         query: $and [ $regex \bkeyword\b (case-insensitive) per keyword ]
        │         display: id, date, content, username for each result
        │         select by number → print all fields
        │         loop: another search?
        │         drop TEXT index on exit
        │
        ├─ [2] search_users(mongo_port)
        │         create TEXT index on user.displayname + user.location
        │         prompt: single keyword
        │         query: $or [ displayname $regex, location $regex ] (whole-word, case-insensitive)
        │         deduplicate by username (set-based)
        │         display: username, displayname, location
        │         select by number → print all user sub-fields
        │         drop index on exit
        │
        ├─ [3] compose_tweet(mongo_port, "user291", text)
        │         derive new tweet_id: max(url.split("/")[-1]) + 1
        │         build full tweet document matching schema (nulls for unknown fields)
        │         insert_one()
        │         create index on 'url' field
        │
        ├─ [4] list_top_tweets(mongo_port)
        │         create indexes on retweetCount, likeCount, quoteCount
        │         prompt: sort field + top-N count
        │         find().sort(field, -1).limit(N)
        │         display: id, date, content, username, field value
        │         select by number → print all fields
        │
        └─ [5] top_users(mongo_port)
                  create indexes on user.followersCount (DESC), user.username (ASC)
                  stream sorted cursor, track max followersCount per username
                  collect first N unique users
                  display: username, displayname, max followers count
                  select by number → print all user sub-fields
```

---

## Project Components (Source Files)

```
f23-proj2-anything-main/
├── main.py                — Entry point: file/port prompts, load, menu loop
├── load_json.py           — Parallel JSONL ingestion into MongoDB (batched, 4 threads)
├── search_tweets.py       — Keyword tweet search with regex AND semantics
├── search_user_proj2.py   — Keyword user search across displayname + location
├── compose_tweets.py      — Insert new tweet with full schema, auto-increment ID
├── list_top_tweets.py     — Top-N tweets sorted by retweet/like/quote count
├── top_users.py           — Top-N unique users by max follower count
├── LLM.md                 — AI tool disclosure (ChatGPT used for JSON schema key extraction)
└── P2 Design - cmput291.pdf — Project specification document
```

---

## Data Model

Each document in the `tweets` collection is a full tweet JSON object with a nested `user` sub-document:

```json
{
  "url":              "https://twitter.com/<user>/status/<id>",
  "date":             "2021-03-30T03:30:30+00:00",
  "content":          "tweet text",
  "id":               1376738579171344386,
  "user": {
    "username":       "handle",
    "displayname":    "Display Name",
    "followersCount": 18,
    "friendsCount":   286,
    "location":       "",
    ...
  },
  "replyCount":       0,
  "retweetCount":     0,
  "likeCount":        1,
  "quoteCount":       0,
  "lang":             "en",
  ...
}
```

There is no separate `users` collection. Users are accessed by querying the `user` sub-document embedded inside each tweet document — the same user appears many times if they authored many tweets. Deduplication is handled in application code.

---

## Indexing Strategy

Each operation creates its required index at call time and (where appropriate) drops it on exit to avoid conflicts with the TEXT index limit (MongoDB allows only one text index per collection).

| Operation | Index Created | Why |
|-----------|--------------|-----|
| Search Tweets | `content` TEXT index | Enables `$text` search; dropped to avoid conflicts |
| Search Users | `user.displayname` + `user.location` TEXT, `user.followersCount` DESC | Full-text on name/location fields |
| Compose Tweet | `url` ASC | Speeds up max-URL lookup for ID generation |
| List Top Tweets | `retweetCount`, `likeCount`, `quoteCount` DESC | Sort performance on engagement fields |
| List Top Users | `user.followersCount` DESC, `user.username` ASC | Sort performance for follower ranking |

The keyword searches use `$regex` with `\b` word-boundary anchors and case-insensitive flag (`$options: "i"`) rather than the MongoDB `$text` operator — this gives whole-word AND semantics across arbitrary keywords without requiring a pre-built text index match.

---

## Loading Strategy

The JSONL file (one JSON object per line) is ingested using a producer/consumer pattern:

```
json_file_batcher(file, batch_size=1000)
    → yields lists of 1000 parsed tweet dicts

ThreadPoolExecutor(max_workers=4)
    → submits insert_batch(collection, batch) for each batch in parallel
    → insert_many() per batch
```

This parallelises MongoDB write I/O across 4 threads. For large datasets (hundreds of thousands of tweets) this significantly reduces load time compared to single-threaded line-by-line insertion.

---

## Learning Takeaways

- **Document databases trade schema rigidity for flexibility.** Unlike SQL, MongoDB stores entire tweet objects as single documents with nested sub-documents. There is no JOIN between a `tweets` table and a `users` table — the user is embedded. This makes reads simple but writes/updates harder to keep consistent.
- **Embedding vs referencing is a core NoSQL design decision.** Embedding the user inside every tweet means no JOIN needed to get user info alongside tweet info, but the same user data is duplicated across thousands of documents. A referencing design (separate users collection) would save space but require application-level joins.
- **Deduplication must be done in application code when no schema enforces uniqueness.** Because the same user appears in many tweet documents, listing unique users requires tracking seen usernames with a set in Python — the database itself doesn't enforce uniqueness on `user.username` across documents.
- **Indexing is a per-query decision.** Creating an index just before a query and dropping it after is a manual version of what a query optimizer automates in a mature RDBMS. It shows the tradeoff explicitly: indexes speed up reads but cost write overhead and storage.
- **MongoDB's TEXT index limit (one per collection) forces tradeoffs.** You can't keep permanent text indexes on both `content` and `user.displayname` simultaneously. The create/drop pattern is a workaround for this constraint.
- **`$regex` with word boundaries is more correct than substring match for keyword search.** A search for "farm" should not match "farming" unless the user intends it. `\b` anchors enforce whole-word semantics.
- **Parallel batch loading is a real technique, not just an optimization.** For millions of records, the difference between serial and parallel insertion can be the difference between a 30-second load and a 5-minute one. `ThreadPoolExecutor` with `insert_many` batches is a practical production pattern.
- **Schema-less doesn't mean schema-free.** The tweet JSON has a well-defined structure from the Twitter scraper. Compose tweet had to replicate that full structure with nulls for unknown fields — discovered by using ChatGPT to extract all keys from a sample document and then matching them manually.

---

## Skills Learned

- **MongoDB:** collection creation/drop, `insert_one`, `insert_many`, `find`, `sort`, `limit`, `create_index`, `drop_index`, `index_information`
- **`pymongo`:** `MongoClient`, query operators (`$and`, `$or`, `$regex`, `$text`), sort/limit chaining, index management
- **NoSQL data modelling:** embedded document design, deduplication strategies, document schema replication
- **Regex query design:** word-boundary anchors (`\b`), case-insensitive flags, `re.escape` for safe user input
- **Parallel I/O:** `concurrent.futures.ThreadPoolExecutor`, producer/consumer batching pattern
- **JSONL parsing:** line-by-line JSON loading, batch accumulation
- **CLI application design:** input validation loops, menu-driven interaction, numbered selection from result lists
- **Index lifecycle management:** create-before-use / drop-after-use pattern under MongoDB's text index limit

## Skills Needed to Go Deeper

- MongoDB aggregation pipeline (`$group`, `$unwind`, `$lookup`) for proper deduplication and cross-document analytics without application-side workarounds
- Separate `users` collection with references (normalization) vs embedded (denormalization) tradeoff analysis at scale
- MongoDB Atlas Search (Lucene-backed) for full-text search that doesn't conflict with field-level text indexes
- Proper index strategy analysis using `explain()` to verify index usage and query plan selection
- Pagination with cursors (`skip`/`limit` vs range-based pagination) for large result sets
- Write concern and read concern settings for consistency guarantees
- Schema validation in MongoDB using `$jsonSchema` validators to enforce document structure
