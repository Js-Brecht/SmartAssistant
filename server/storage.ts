import { 
  users, emails, tasks, calendarEvents, contacts, aiDrafts, projects,
  type User, type InsertUser,
  type Email, type InsertEmail,
  type Task, type InsertTask,
  type CalendarEvent, type InsertCalendarEvent,
  type Contact, type InsertContact,
  type AiDraft, type InsertAiDraft,
  type Project, type InsertProject
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Emails
  getEmails(userId: number, limit?: number): Promise<Email[]>;
  getEmailById(id: number): Promise<Email | undefined>;
  createEmail(email: InsertEmail): Promise<Email>;
  updateEmail(id: number, updates: Partial<Email>): Promise<Email | undefined>;
  deleteEmail(id: number): Promise<boolean>;
  getEmailsByPriority(userId: number, priority: string): Promise<Email[]>;
  getUnreadEmails(userId: number): Promise<Email[]>;

  // Tasks
  getTasks(userId: number): Promise<Task[]>;
  getTaskById(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  getTasksByStatus(userId: number, status: string): Promise<Task[]>;
  getTodayTasks(userId: number): Promise<Task[]>;

  // Calendar Events
  getCalendarEvents(userId: number): Promise<CalendarEvent[]>;
  getCalendarEventById(id: number): Promise<CalendarEvent | undefined>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: number, updates: Partial<CalendarEvent>): Promise<CalendarEvent | undefined>;
  deleteCalendarEvent(id: number): Promise<boolean>;
  getTodayEvents(userId: number): Promise<CalendarEvent[]>;

  // Contacts
  getContacts(userId: number): Promise<Contact[]>;
  getContactById(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, updates: Partial<Contact>): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<boolean>;

  // AI Drafts
  getAiDrafts(userId: number): Promise<AiDraft[]>;
  getAiDraftById(id: number): Promise<AiDraft | undefined>;
  createAiDraft(draft: InsertAiDraft): Promise<AiDraft>;
  updateAiDraft(id: number, updates: Partial<AiDraft>): Promise<AiDraft | undefined>;
  deleteAiDraft(id: number): Promise<boolean>;
  getDraftsByStatus(userId: number, status: string): Promise<AiDraft[]>;

  // Projects
  getProjects(userId: number): Promise<Project[]>;
  getProjectById(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private emails: Map<number, Email> = new Map();
  private tasks: Map<number, Task> = new Map();
  private calendarEvents: Map<number, CalendarEvent> = new Map();
  private contacts: Map<number, Contact> = new Map();
  private aiDrafts: Map<number, AiDraft> = new Map();
  private projects: Map<number, Project> = new Map();
  
  private currentUserId = 1;
  private currentEmailId = 1;
  private currentTaskId = 1;
  private currentCalendarEventId = 1;
  private currentContactId = 1;
  private currentAiDraftId = 1;
  private currentProjectId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Create default user
    const defaultUser: User = {
      id: 1,
      username: "john.doe",
      password: "password123",
      email: "john@company.com",
      name: "John Doe"
    };
    this.users.set(1, defaultUser);
    this.currentUserId = 2;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Emails
  async getEmails(userId: number, limit = 50): Promise<Email[]> {
    return Array.from(this.emails.values())
      .filter(email => email.userId === userId)
      .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
      .slice(0, limit);
  }

  async getEmailById(id: number): Promise<Email | undefined> {
    return this.emails.get(id);
  }

  async createEmail(insertEmail: InsertEmail): Promise<Email> {
    const id = this.currentEmailId++;
    const email: Email = { 
      ...insertEmail, 
      id, 
      receivedAt: new Date(),
      tags: insertEmail.tags || []
    };
    this.emails.set(id, email);
    return email;
  }

  async updateEmail(id: number, updates: Partial<Email>): Promise<Email | undefined> {
    const email = this.emails.get(id);
    if (!email) return undefined;
    
    const updated = { ...email, ...updates };
    this.emails.set(id, updated);
    return updated;
  }

  async deleteEmail(id: number): Promise<boolean> {
    return this.emails.delete(id);
  }

  async getEmailsByPriority(userId: number, priority: string): Promise<Email[]> {
    return Array.from(this.emails.values())
      .filter(email => email.userId === userId && email.priority === priority)
      .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
  }

  async getUnreadEmails(userId: number): Promise<Email[]> {
    return Array.from(this.emails.values())
      .filter(email => email.userId === userId && !email.isRead);
  }

  // Tasks
  async getTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getTaskById(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = { 
      ...insertTask, 
      id, 
      createdAt: new Date(),
      completedAt: null
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updated = { ...task, ...updates };
    if (updates.status === 'completed' && !task.completedAt) {
      updated.completedAt = new Date();
    }
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async getTasksByStatus(userId: number, status: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.userId === userId && task.status === status);
  }

  async getTodayTasks(userId: number): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Array.from(this.tasks.values())
      .filter(task => 
        task.userId === userId && 
        task.dueDate && 
        new Date(task.dueDate) >= today && 
        new Date(task.dueDate) < tomorrow
      );
  }

  // Calendar Events
  async getCalendarEvents(userId: number): Promise<CalendarEvent[]> {
    return Array.from(this.calendarEvents.values())
      .filter(event => event.userId === userId)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }

  async getCalendarEventById(id: number): Promise<CalendarEvent | undefined> {
    return this.calendarEvents.get(id);
  }

  async createCalendarEvent(insertEvent: InsertCalendarEvent): Promise<CalendarEvent> {
    const id = this.currentCalendarEventId++;
    const event: CalendarEvent = { 
      ...insertEvent, 
      id,
      attendees: insertEvent.attendees || []
    };
    this.calendarEvents.set(id, event);
    return event;
  }

  async updateCalendarEvent(id: number, updates: Partial<CalendarEvent>): Promise<CalendarEvent | undefined> {
    const event = this.calendarEvents.get(id);
    if (!event) return undefined;
    
    const updated = { ...event, ...updates };
    this.calendarEvents.set(id, updated);
    return updated;
  }

  async deleteCalendarEvent(id: number): Promise<boolean> {
    return this.calendarEvents.delete(id);
  }

  async getTodayEvents(userId: number): Promise<CalendarEvent[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Array.from(this.calendarEvents.values())
      .filter(event => 
        event.userId === userId && 
        new Date(event.startTime) >= today && 
        new Date(event.startTime) < tomorrow
      )
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }

  // Contacts
  async getContacts(userId: number): Promise<Contact[]> {
    return Array.from(this.contacts.values())
      .filter(contact => contact.userId === userId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getContactById(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.currentContactId++;
    const contact: Contact = { 
      ...insertContact, 
      id, 
      createdAt: new Date(),
      tags: insertContact.tags || [],
      lastContactDate: null
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async updateContact(id: number, updates: Partial<Contact>): Promise<Contact | undefined> {
    const contact = this.contacts.get(id);
    if (!contact) return undefined;
    
    const updated = { ...contact, ...updates };
    this.contacts.set(id, updated);
    return updated;
  }

  async deleteContact(id: number): Promise<boolean> {
    return this.contacts.delete(id);
  }

  // AI Drafts
  async getAiDrafts(userId: number): Promise<AiDraft[]> {
    return Array.from(this.aiDrafts.values())
      .filter(draft => draft.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAiDraftById(id: number): Promise<AiDraft | undefined> {
    return this.aiDrafts.get(id);
  }

  async createAiDraft(insertDraft: InsertAiDraft): Promise<AiDraft> {
    const id = this.currentAiDraftId++;
    const draft: AiDraft = { 
      ...insertDraft, 
      id, 
      createdAt: new Date(),
      approvedAt: null,
      sentAt: null
    };
    this.aiDrafts.set(id, draft);
    return draft;
  }

  async updateAiDraft(id: number, updates: Partial<AiDraft>): Promise<AiDraft | undefined> {
    const draft = this.aiDrafts.get(id);
    if (!draft) return undefined;
    
    const updated = { ...draft, ...updates };
    if (updates.status === 'approved' && !draft.approvedAt) {
      updated.approvedAt = new Date();
    }
    if (updates.status === 'sent' && !draft.sentAt) {
      updated.sentAt = new Date();
    }
    this.aiDrafts.set(id, updated);
    return updated;
  }

  async deleteAiDraft(id: number): Promise<boolean> {
    return this.aiDrafts.delete(id);
  }

  async getDraftsByStatus(userId: number, status: string): Promise<AiDraft[]> {
    return Array.from(this.aiDrafts.values())
      .filter(draft => draft.userId === userId && draft.status === status);
  }

  // Projects
  async getProjects(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(project => project.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getProjectById(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const project: Project = { 
      ...insertProject, 
      id, 
      createdAt: new Date(),
      tags: insertProject.tags || []
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updated = { ...project, ...updates };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }
}

export const storage = new MemStorage();
