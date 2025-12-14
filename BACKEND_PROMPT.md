# Spring Boot Translation API - Backend Implementation Prompt

## Project Overview

Create a production-ready Spring Boot REST API that serves as a translation backend for the `@polyglot/react` library. The API will use AWS Translate for translations, implement intelligent caching with Redis, track usage for billing, and provide API key authentication.

## Tech Stack

- **Framework:** Spring Boot 3.2+
- **Language:** Java 17+
- **Database:** PostgreSQL (for users & usage logs)
- **Cache:** Redis (for translation caching)
- **Translation Service:** AWS Translate
- **Build Tool:** Maven or Gradle
- **Dependencies:**
  - Spring Web
  - Spring Data JPA
  - Spring Cache
  - Spring Data Redis
  - AWS SDK for Java (Translate)
  - Lombok
  - Validation
  - PostgreSQL Driver

## Core Requirements

### 1. Project Structure

```
translation-backend/
├── src/main/java/com/polyglot/backend/
│   ├── TranslationBackendApplication.java
│   ├── config/
│   │   ├── AwsConfig.java
│   │   ├── CacheConfig.java
│   │   └── CorsConfig.java
│   ├── controller/
│   │   ├── TranslationController.java
│   │   └── HealthController.java
│   ├── service/
│   │   ├── TranslationService.java
│   │   ├── AwsTranslateService.java
│   │   ├── CacheService.java
│   │   └── UsageTrackingService.java
│   ├── model/
│   │   ├── dto/
│   │   │   ├── TranslationRequest.java
│   │   │   └── TranslationResponse.java
│   │   └── entity/
│   │       ├── User.java
│   │       └── UsageLog.java
│   ├── repository/
│   │   ├── UserRepository.java
│   │   └── UsageLogRepository.java
│   ├── security/
│   │   ├── ApiKeyFilter.java
│   │   └── ApiKeyValidator.java
│   └── exception/
│       ├── GlobalExceptionHandler.java
│       └── InsufficientCreditsException.java
└── src/main/resources/
    └── application.yml
```

### 2. API Endpoints

#### POST /api/translate

**Request Body:**

```json
{
  "texts": {
    "Welcome": "Welcome",
    "Hello World": "Hello World"
  },
  "sourceLang": "en",
  "targetLang": "hi"
}
```

**Request Headers:**

```
X-API-Key: user_api_key_here
Content-Type: application/json
```

**Response:**

```json
{
  "translations": {
    "Welcome": "स्वागत",
    "Hello World": "नमस्ते दुनिया"
  },
  "sourceLang": "en",
  "targetLang": "hi",
  "cached": false,
  "charCount": 17
}
```

**Response Headers:**

```
X-Usage-Remaining: 45000
X-Cache-Hit-Rate: 0.75
```

#### GET /api/health

```json
{
  "status": "UP",
  "redis": "CONNECTED",
  "database": "CONNECTED",
  "awsTranslate": "AVAILABLE"
}
```

#### GET /api/stats (Optional - Admin only)

```json
{
  "totalTranslations": 15000,
  "cacheHitRate": 0.82,
  "activeUsers": 45,
  "todayUsage": {
    "characters": 125000,
    "apiCalls": 320
  }
}
```

### 3. Database Schema

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'FREE',
    usage_limit BIGINT NOT NULL DEFAULT 50000,
    usage_current BIGINT NOT NULL DEFAULT 0,
    reset_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE usage_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    char_count INTEGER NOT NULL,
    source_lang VARCHAR(10) NOT NULL,
    target_lang VARCHAR(10) NOT NULL,
    cached BOOLEAN NOT NULL DEFAULT FALSE,
    cost DECIMAL(10, 6) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usage_user_date ON usage_logs(user_id, created_at);
CREATE INDEX idx_users_api_key ON users(api_key);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at);
```

### 4. AWS Translate Integration

**Key Requirements:**

- Use AWS SDK for Java (`software.amazon.awssdk:translate`)
- Implement batch translation with delimiter concatenation strategy
- Delimiter: `\n|||TXTSEP|||\n`
- Handle delimiter modification by AWS (use flexible regex for splitting)
- Implement retry logic (3 attempts with exponential backoff)
- Track AWS API costs ($15 per million characters)

**Example Implementation Logic:**

```java
// Concatenate all texts with delimiter
String concatenated = String.join("\n|||TXTSEP|||\n", texts);

// Translate in single API call
TranslateTextRequest request = TranslateTextRequest.builder()
    .text(concatenated)
    .sourceLanguageCode(sourceLang)
    .targetLanguageCode(targetLang)
    .build();

TranslateTextResponse response = translateClient.translateText(request);

// Split response (handle AWS modifying delimiter)
String[] translated = response.translatedText()
    .split("\\n\\s*\\|+\\s*T\\s*X\\s*T\\s*S\\s*E\\s*P\\s*\\|+\\s*\\n");
```

### 5. Redis Caching Strategy

**Cache Key Format:**

```
translation:{sourceLang}:{targetLang}:{textHash}
```

**Example:**

```
translation:en:hi:a3f5b8c9d2e1
```

**Cache Configuration:**

- TTL: 30 days (2592000 seconds)
- Max Memory Policy: `allkeys-lru`
- Serialize as JSON
- Use Spring Cache abstraction with `@Cacheable`

**Implementation:**

```java
@Cacheable(value = "translations", key = "#text.hashCode() + ':' + #sourceLang + ':' + #targetLang")
public String translate(String text, String sourceLang, String targetLang) {
    // Translation logic
}
```

### 6. API Key Authentication

**Implementation Requirements:**

- Use Spring Filter to intercept requests
- Extract `X-API-Key` header
- Validate against `users` table
- Check if user is active
- Check usage limits before processing
- Return 401 if invalid, 429 if limit exceeded

**Filter Example:**

```java
@Component
public class ApiKeyFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) {
        String apiKey = request.getHeader("X-API-Key");
        // Validation logic
    }
}
```

### 7. Usage Tracking & Billing

**Track on Every Translation:**

1. Count characters in request
2. Check cache hit/miss
3. Calculate cost: `charCount * 0.000015` (AWS pricing)
4. Log to `usage_logs` table
5. Update `users.usage_current`
6. Check if limit exceeded

**Monthly Reset:**

- Reset `usage_current` to 0 on `reset_date`
- Set new `reset_date` to next month

### 8. Configuration (application.yml)

```yaml
spring:
  application:
    name: polyglot-translation-api

  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:translations}
    username: ${DB_USER:postgres}
    password: ${DB_PASSWORD:password}
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        format_sql: true

  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      password: ${REDIS_PASSWORD:}
      timeout: 2000ms

  cache:
    type: redis
    redis:
      time-to-live: 2592000000 # 30 days in milliseconds

aws:
  translate:
    region: ${AWS_REGION:us-east-1}
    access-key-id: ${AWS_ACCESS_KEY_ID}
    secret-access-key: ${AWS_SECRET_ACCESS_KEY}

server:
  port: ${PORT:8080}
  servlet:
    context-path: /

logging:
  level:
    com.polyglot.backend: INFO
    org.springframework.cache: DEBUG
```

### 9. CORS Configuration

**Allow Origins:**

- `http://localhost:5173` (Vite dev)
- `http://localhost:3000` (React dev)
- `https://usepolyglot.dev` (Production landing page)
- `https://demo.usepolyglot.dev` (Demo app)

**Implementation:**

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(
                "http://localhost:5173",
                "http://localhost:3000",
                "https://usepolyglot.dev",
                "https://demo.usepolyglot.dev"
            )
            .allowedMethods("GET", "POST", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

### 10. Error Handling

**Custom Exceptions:**

- `InvalidApiKeyException` → 401 Unauthorized
- `InsufficientCreditsException` → 429 Too Many Requests
- `TranslationServiceException` → 503 Service Unavailable
- `InvalidRequestException` → 400 Bad Request

**Global Exception Handler:**

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(InvalidApiKeyException.class)
    public ResponseEntity<ErrorResponse> handleInvalidApiKey(InvalidApiKeyException ex) {
        return ResponseEntity.status(401)
            .body(new ErrorResponse("Invalid API key", 401));
    }
    // Other handlers...
}
```

### 11. Rate Limiting

**Requirements:**

- 100 requests per minute per API key
- Use Redis for distributed rate limiting
- Return 429 with `Retry-After` header

**Implementation Suggestion:**

- Use Bucket4j library
- Store rate limit state in Redis
- Configure in `application.yml`

### 12. Testing Requirements

**Unit Tests:**

- Test translation service logic
- Test cache hit/miss scenarios
- Test API key validation
- Test usage tracking

**Integration Tests:**

- Test full API flow with test database
- Test Redis caching
- Test AWS Translate integration (mock in tests)

### 13. Deployment Configuration

**Environment Variables:**

```bash
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=translations
DB_USER=admin
DB_PASSWORD=secure_password

REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

PORT=8080
```

**Dockerfile:**

```dockerfile
FROM openjdk:17-slim
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 14. Initial Data Seeding

**Create Test User:**

```sql
INSERT INTO users (email, api_key, plan, usage_limit, reset_date) VALUES
('test@example.com', 'test_api_key_12345', 'FREE', 50000, CURRENT_TIMESTAMP + INTERVAL '30 days');
```

## Additional Features (Optional but Recommended)

1. **Health Checks:** Implement Spring Boot Actuator
2. **Metrics:** Track cache hit rate, response times, error rates
3. **Logging:** Structured logging with request IDs
4. **API Documentation:** Swagger/OpenAPI spec
5. **Admin Endpoints:** User management, usage reports
6. **Webhooks:** Notify when usage limit reached
7. **Multiple AWS Regions:** Failover and latency optimization

## Success Criteria

✅ Single API call translates entire batch (not one-per-text)  
✅ Redis caching reduces AWS costs by 80%+  
✅ API key authentication works correctly  
✅ Usage tracking and limits enforced  
✅ CORS configured for frontend integration  
✅ Error handling returns proper HTTP status codes  
✅ Builds and runs with `mvn spring-boot:run`  
✅ Can be deployed to Railway/Render/AWS  
✅ Includes README with setup instructions

## Expected Project Timeline

- **Setup & Dependencies:** 1 hour
- **Core Translation Service:** 2-3 hours
- **Database & JPA:** 2 hours
- **Redis Caching:** 1-2 hours
- **Authentication & Rate Limiting:** 2 hours
- **Testing:** 2-3 hours
- **Documentation & Deployment:** 1-2 hours

**Total:** 12-15 hours (1-2 days)

## Final Deliverables

1. Complete Spring Boot application
2. Database migration scripts
3. Docker Compose for local development (app + postgres + redis)
4. Deployment instructions for Railway/Render
5. Postman collection or curl examples for testing
6. README.md with setup and API documentation

---

## Production Deployment URLs

**Domain:** `usepolyglot.dev`

**Services:**

- Main Site: `https://usepolyglot.dev`
- API Backend: `https://api.usepolyglot.dev`
- Documentation: `https://docs.usepolyglot.dev`
- Live Demo: `https://demo.usepolyglot.dev`
- Dashboard: `https://app.usepolyglot.dev` (future)

**npm Packages:**

- `@polyglot/react` - React library (current)
- `@polyglot/native` - React Native (future)
- `@polyglot/vue` - Vue.js (future)
- `@polyglot/angular` - Angular (future)
- `@polyglot/ios` - iOS SDK (future)
- `@polyglot/android` - Android SDK (future)

---

**Note:** This backend will serve as the revenue engine for the entire Polyglot ecosystem. All platform SDKs (React, React Native, Vue, iOS, Android, etc.) are free (MIT), but users pay for translation API usage through this backend at `api.usepolyglot.dev`.
