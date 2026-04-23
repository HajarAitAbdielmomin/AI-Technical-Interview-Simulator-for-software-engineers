# 🎯 IntervAI - AI-Powered Technical Interview Simulator
> Simulate real technical interviews with AI personas powered by DigitalOcean Gradient AI.

🎥 **Demo Video:** https://youtu.be/sc45rTcTK2M?si=saplp_z1iMguwsdl 

📦 **Tech Stack:** Spring Boot | Spring AI | Angular | MySQL Database | Docker | DigitalOcean - Gradient AI

---
## 🧠 About this project :

Interv AI is an intelligent interview simulator that puts candidates 
in front of AI-powered interviewers with distinct personalities, tones, 
and evaluation styles simulating real-world hiring scenarios.

Users can:
- Choose their tech stack (Java, JavaScript, AWS...)
- Pick an AI interviewer persona
- Choose their level (Intern, Junior, Senior...)
- Answer 8 questions in a 30 minutes timed session
- Receive structured feedback with a score, strengths, weaknesses, and improvement suggestions

---
## ☁️ DigitalOcean Services Used

| Service | Usage |
|---|---|
| **App Platform** | Hosts the Spring Boot backend and Angular frontend |
| **DigitalOcean - Managed DB MySQL** | Persists users, interviews, Q&A history, and feedback |
| **Gradient AI - Serverless Inference** | Powers question generation and answer evaluation |
| **VPC** | Secures internal communication between App Platform and Managed MySQL |

---
## 🎭 AI Interviewer Personas

One of the core features of Interv AI is its **AI personality system**.
Each interviewer has a name, role, tone, and behavior injected via 
a custom `PersonaPromptBuilder` class as a system prompt on every AI call.

Users can select between different AI interviewer personas:
| Persona | Name |Style |
|---|---|---|
| **🏢 Strict FAANG Engineer** | 👨‍💼 Dr. Alex Reid |challenging questions |
| **🚀 Friendly Startup CTO** | 🧑‍💻 Jordan Chen | conversational and practical |
| **🤝 Junior Friendly Mentor** | 🙍🏻‍♀️ Sam Rivera | beginner-focused questions |

---
## 🔧 Prompt Engineering Highlights
### Temperature Tuning
| Task | Model | Temperature | Reason |
|---|---|---|---|
| Question Generation | `openai-gpt-oss-20b` | `0.7` | Varied, creative questions |
| Answer Evaluation | `openai-gpt-oss-120b` | `0.4` | Consistent, fair scoring |

---
## 🏗️ Architecture
![project architecture](https://github.com/user-attachments/assets/d82a161d-40aa-4ccf-a4dd-8750036d310b)


---
## 📊 Class Diagram of the project
![digitalocean-hackathon](https://github.com/user-attachments/assets/6155c55c-9e40-4e22-ad18-fc49cd6e0320)

---
## 🚀 Getting Started
### Prerequisites
- Java 17
- Node 20
- MySQL (local) or DigitalOcean Managed MySQL

### Environment Variables
In Backend side create a `.env` file in `/Backend` based on `.env.example`:
```properties
GRADIENT_MODEL_ACCESS_KEY=your_gradient_api_key
DB_URL=jdbc:mysql://<host>:<port>/<db_name>
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret
```
In Frontend side create `environment.ts` file in `/Frontend` under src/environments
```properties
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8989/api',
};
```

### Run Locally
```bash
# Backend
cd Backend
./mvnw spring-boot:run    # runs on http://localhost:8989

# Frontend
cd Frontend
npm install
ng serve                  # runs on http://localhost:4200
```
### Run Backend with Docker
  Prerequisites
- Docker installed on your machine and authenticated
```bash
   cd Backend
   # Build the Docker image
   docker build -t techinterview-ai .
   # Run the Docker container
   docker run -p 8989:8989 \
  -e SPRING_DATASOURCE_URL="jdbc:mysql://host.docker.internal:3306/db_name" \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=<your-password> \
  -e hajar.app.jwtSecret="<your-jwt-secret>" \
  -e hajar.app.jwtExpirationMs=86400000 \
  -e GRADIENT_MODEL_ACCESS_KEY="<your-gradient-api-key>" \
  techinterview-ai

   docker stop <container-id>   # Stop the container

```

---

## 📡 API Endpoints
### User Management (/api/users)

- POST /api/users/auth/signin - Authenticate user
- POST /api/users/auth/signup - Register new user
- DELETE /api/users/delete/{id} - Delete user by ID

### Interview Management (/api/interviews)

- POST /api/interviews/start - Start a new interview
- GET /api/interviews/{id} - Get interview by ID
- GET /api/interviews/{id}/next-question - Get next question in interview
- POST /api/interviews/answer - Submit answer to a question
- GET /api/interviews/{id}/end - End an interview
- GET /api/interviews/{id}/resume - Resume an interview
- GET /api/interviews/user/{id} - Get last 3 completed interviews with detailed information for a user
- GET /api/interviews/user/{id}/all - Get all interviews with detailed information for a user
- DELETE /api/interviews/{id}/delete - Delete interview by ID

### Feedback Management (/api/feedbacks)

- GET /api/feedbacks/{id}/feedback - Get feedback for interview
- GET /api/feedbacks/user/{id}/statistics - Get user statistics

📖 Full API docs: `http://localhost:8989/swagger-ui/index.html`

---

## 👤 Built By

**Hajar Ait abdielmomin** - Software Engineer  
Built solo for the **DigitalOcean Gradient™ AI Hackathon** with MLH.

