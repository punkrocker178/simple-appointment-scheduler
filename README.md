# Overview
The universal scheduler is a Nuxt 4 application that provide digital appointment booking between customers and dealership.
The Frontend application guides the user through selecting a vehicle, service type, and desired date, then present only valid appointment slots based on Backend availability checks. The Backend layer (Nitro server) served as a mock with basic operations.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install
# OR
# yarn
yarn install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# yarn
yarn dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# yarn
yarn preview
```

## Testing

Tested components and composables are in `test/` directory
```bash
npm run test
```


## AI Collboration
This project was planned, implemented in collaboration with Generative AI.
I use different GenAI for different phase of the project. 

### Phase 0: Research and evaluate the 4 scenarios (Perplexity AI)
Before picking up a scenario, I just want to make sure that I have understand all the requirements of the 4 scenarios. From there, combined with my Frontend skillset, I asked and discuss with Perplexity to construct a comparison table between the 4 scenarios to evaluate the complexity and risks. From the results, I can see that scenario A has many aspects that can be demonstrated on the Frontend layer.
Here are the steps I've done:
1. Compare the four challenge scenarios and evaluate complexity, implementation risk, and frontend suitability.
2. Identify the business problem behind Scenario A beyond the raw functional requirements.
3. To shape realistic assumptions for an ambiguous problem statement.
4. Brainstorm and choosing tech stack. Should I choose Angular because of my expertise or should I use Nuxt because I recently worked on.
5. To explore implementation trade-offs between frontend-only mocking approaches and a more production-like Nuxt plus Nitro architecture.
6. Outline the initial architecture, API boundaries, state management strategy, and observability approach.

### Phase 1: Planning and Design (Github Copilot)
After I have an initial overview of the architecture, I feed the initial plan to Copilot and start discussing the implementation plan.
1. Feed initial overview architecture to Copilot using Plan mode. Discussing back and forth with Copilot , make sure that my intentions are clear, to only focus on the Frontend layer, the Backend layer served as a mock.
2. Review and refine the plan.
3. Before starting the implementation, I make sure to prepare the skills.md for the AI agent. For this project I added "create agent.md" to create `AGENTS.md` file for any AI agents must follow the project convention and have the same idea. I also added  "nuxt" and "nuxt-testing" skills to make sure AI agents are follow the best practices of Nuxt development and testing.

### Phase 2: Implementation (Github Copilot, Amazon Q/Kiro)
After the I have the implementation plan, I initialize the project with the skills I prepared. Then I switch to Agent mode and begin implementation. **This phase has the most interactions with the AI because there are new issues faced in implementation steps.**
1. Implement the 1st stage of the plan: Backend layer (Nitro server)
2. Verifying the output by review generated code. If looks good, then process to do manual verification on Postman.
3. While verifying on Postman, I faced and issue with the timezone. **I created a new chat session to fix the issue to avoid using all of the context of the main planning chat session.**
4. After verifying the Backend layer logic flow. I green lighted Copilot to start scaffolding the Frontend implementation.
5. I realized that I need to use Vuetify library for implementing complex UI components so I go back to the plan and updated it.
6. After Frontend has done scaffolded, I reviewed the generated file and then compared the file structure with the implementation plan. Make sure all files in `pages` , `composables`, `components` are generated.
7. I verified manually by running the dev server to check for build errors and run time errors. I also fixed minor consistencies in the code.
8. I continue to test out the flow logic and tell Copilot to generated unit tests on crucial components and logic. The `VehicleForm` and `TimeSlotGrid` components are tested because it's the main part in the flow. Tests consist of validating the UI state and the events that these components have.
9. Created `ARCHITECTURE.md` to provide a comprehensive overall architecture and implementation details of the Frontend layer. This was made for both humans and AI agents to understand the project on the deeper level.

### Phase 3: Refinement (Github Copilot, Amazon Q/Kiro)
The core application is working. However, the code still contains inconsistencies due to using different AI agent (Amazon Q continued the implementation when Copilot hit the limit). The UI has some issues also due to Tailwindcss + Vuetify styling overlapped.
1. I noticed the way data flowing to the component is not my preference (Component take parent data as props and then emit the data back to the parent). I wanted to strictly enforce data state should be using the state management flow (Get data from store, update value to store directly) so I asked AI to scan for components and follow my suggestions.
2. I researched and asked AI to come up with the solutions for Tailwind + Vuetify styling issue.
3. Fixed lint errors manually.

### How GenAI Output Was Verified
At **Phase 0** and **Phase 1**, I wanted to make sure:
- The generated files are matching with the planned architecture.
- Produce a coherent user experience for a booking workflow
- Do not introduce unnecessary complexity.

At **Phase 2**, I mostly verified that I can understand what the AI generated and what are the next steps. Verify those next steps are aligned with the implementation plan.
- Review generated code
- Verify the code are running and logic is correct.
- Verify tests are reflecting the logic and all tests are passing.
- Anticipate the next steps

At **Phase 3**, mostly are just conversational chats about the issue and how to fix that, no more feature planning here.

# Additional information
For further information, please refer to the Scenario A System Design.md file