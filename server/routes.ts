import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertEmailSchema, insertTaskSchema, insertCalendarEventSchema, 
  insertContactSchema, insertAiDraftSchema, insertProjectSchema 
} from "@shared/schema";
import { analyzeEmail, generateEmailResponse, summarizeEmails } from "./services/ai";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const DEFAULT_USER_ID = 1; // For demo purposes

  // Email routes
  app.get("/api/emails", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const emails = await storage.getEmails(DEFAULT_USER_ID, limit);
      res.json(emails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emails" });
    }
  });

  app.get("/api/emails/priority/:priority", async (req, res) => {
    try {
      const { priority } = req.params;
      const emails = await storage.getEmailsByPriority(DEFAULT_USER_ID, priority);
      res.json(emails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch priority emails" });
    }
  });

  app.get("/api/emails/unread", async (req, res) => {
    try {
      const emails = await storage.getUnreadEmails(DEFAULT_USER_ID);
      res.json(emails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread emails" });
    }
  });

  app.get("/api/emails/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const email = await storage.getEmailById(id);
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }
      res.json(email);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch email" });
    }
  });

  app.post("/api/emails", async (req, res) => {
    try {
      const emailData = insertEmailSchema.parse({ ...req.body, userId: DEFAULT_USER_ID });
      const email = await storage.createEmail(emailData);
      
      // Analyze email with AI
      try {
        const analysis = await analyzeEmail(email.content, email.subject, email.sender);
        const updatedEmail = await storage.updateEmail(email.id, {
          priority: analysis.priority,
          category: analysis.category,
          aiSummary: analysis.summary,
          responseNeeded: analysis.responseNeeded,
          tags: [...(email.tags || []), ...analysis.actionItems]
        });
        
        // Create suggested tasks
        for (const task of analysis.suggestedTasks) {
          await storage.createTask({
            userId: DEFAULT_USER_ID,
            title: task.title,
            description: task.description,
            priority: task.priority,
            sourceType: "email",
            sourceId: email.id,
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined
          });
        }
        
        res.json(updatedEmail || email);
      } catch (aiError) {
        console.error("AI analysis failed:", aiError);
        res.json(email);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create email" });
    }
  });

  app.patch("/api/emails/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const email = await storage.updateEmail(id, req.body);
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }
      res.json(email);
    } catch (error) {
      res.status(500).json({ message: "Failed to update email" });
    }
  });

  app.delete("/api/emails/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteEmail(id);
      if (!deleted) {
        return res.status(404).json({ message: "Email not found" });
      }
      res.json({ message: "Email deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete email" });
    }
  });

  // AI Draft routes
  app.get("/api/ai-drafts", async (req, res) => {
    try {
      const drafts = await storage.getAiDrafts(DEFAULT_USER_ID);
      res.json(drafts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch AI drafts" });
    }
  });

  app.get("/api/ai-drafts/status/:status", async (req, res) => {
    try {
      const { status } = req.params;
      const drafts = await storage.getDraftsByStatus(DEFAULT_USER_ID, status);
      res.json(drafts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch drafts by status" });
    }
  });

  app.post("/api/ai-drafts/generate", async (req, res) => {
    try {
      const { emailId, recipientEmail, recipientName, context, tone } = req.body;
      
      let originalEmail = null;
      if (emailId) {
        originalEmail = await storage.getEmailById(emailId);
        if (!originalEmail) {
          return res.status(404).json({ message: "Original email not found" });
        }
      }

      const draftResponse = await generateEmailResponse(
        originalEmail?.subject || "Follow-up",
        originalEmail?.content || "",
        originalEmail?.sender || recipientName || "Recipient",
        context,
        tone || "professional"
      );

      const draft = await storage.createAiDraft({
        userId: DEFAULT_USER_ID,
        emailId: emailId || undefined,
        recipientEmail,
        recipientName: recipientName || "",
        subject: draftResponse.subject,
        content: draftResponse.content,
        tone: draftResponse.tone,
        confidence: draftResponse.confidence
      });

      res.json(draft);
    } catch (error) {
      console.error("Draft generation error:", error);
      res.status(500).json({ message: "Failed to generate AI draft" });
    }
  });

  app.patch("/api/ai-drafts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const draft = await storage.updateAiDraft(id, req.body);
      if (!draft) {
        return res.status(404).json({ message: "Draft not found" });
      }
      res.json(draft);
    } catch (error) {
      res.status(500).json({ message: "Failed to update draft" });
    }
  });

  // Task routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks(DEFAULT_USER_ID);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/today", async (req, res) => {
    try {
      const tasks = await storage.getTodayTasks(DEFAULT_USER_ID);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's tasks" });
    }
  });

  app.get("/api/tasks/status/:status", async (req, res) => {
    try {
      const { status } = req.params;
      const tasks = await storage.getTasksByStatus(DEFAULT_USER_ID, status);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks by status" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse({ ...req.body, userId: DEFAULT_USER_ID });
      const task = await storage.createTask(taskData);
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.updateTask(id, req.body);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTask(id);
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Calendar routes
  app.get("/api/calendar/events", async (req, res) => {
    try {
      const events = await storage.getCalendarEvents(DEFAULT_USER_ID);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  app.get("/api/calendar/events/today", async (req, res) => {
    try {
      const events = await storage.getTodayEvents(DEFAULT_USER_ID);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's events" });
    }
  });

  app.post("/api/calendar/events", async (req, res) => {
    try {
      const eventData = insertCalendarEventSchema.parse({ ...req.body, userId: DEFAULT_USER_ID });
      const event = await storage.createCalendarEvent(eventData);
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create calendar event" });
    }
  });

  app.patch("/api/calendar/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.updateCalendarEvent(id, req.body);
      if (!event) {
        return res.status(404).json({ message: "Calendar event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to update calendar event" });
    }
  });

  // Contact routes
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts(DEFAULT_USER_ID);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse({ ...req.body, userId: DEFAULT_USER_ID });
      const contact = await storage.createContact(contactData);
      res.json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create contact" });
    }
  });

  app.patch("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contact = await storage.updateContact(id, req.body);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ message: "Failed to update contact" });
    }
  });

  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects(DEFAULT_USER_ID);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse({ ...req.body, userId: DEFAULT_USER_ID });
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/dashboard", async (req, res) => {
    try {
      const [unreadEmails, pendingTasks, todayEvents, readyDrafts] = await Promise.all([
        storage.getUnreadEmails(DEFAULT_USER_ID),
        storage.getTasksByStatus(DEFAULT_USER_ID, "pending"),
        storage.getTodayEvents(DEFAULT_USER_ID),
        storage.getDraftsByStatus(DEFAULT_USER_ID, "draft")
      ]);

      const stats = {
        unreadEmails: unreadEmails.length,
        pendingTasks: pendingTasks.length,
        todayMeetings: todayEvents.length,
        aiDrafts: readyDrafts.length,
        urgentTasks: pendingTasks.filter(t => t.priority === "urgent").length,
        highPriorityEmails: unreadEmails.filter(e => e.priority === "high").length
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard analytics" });
    }
  });

  app.post("/api/ai/summarize-emails", async (req, res) => {
    try {
      const { emailIds } = req.body;
      const emails = [];
      
      for (const id of emailIds) {
        const email = await storage.getEmailById(id);
        if (email) {
          emails.push({
            subject: email.subject,
            content: email.content,
            sender: email.sender
          });
        }
      }

      const summary = await summarizeEmails(emails);
      res.json({ summary });
    } catch (error) {
      res.status(500).json({ message: "Failed to summarize emails" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
