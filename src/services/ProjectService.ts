
import { CrawlProject, ScrapedContent } from './ScraperTypes';
import { SitemapService } from './SitemapService';

export class ProjectService {
  private static projects: CrawlProject[] = [];
  
  /**
   * Creates a new project
   */
  public static createProject(id: string, name: string, startUrl: string): CrawlProject {
    const newProject: CrawlProject = {
      id: id,
      name: name,
      startUrl: startUrl,
      createdAt: new Date(),
      pageCount: 0,
    };
    
    this.projects.push(newProject);
    return newProject;
  }
  
  /**
   * Update the page count for a project
   */
  public static updateProjectPageCount(projectId: string, count: number): void {
    const projectIndex = this.projects.findIndex(p => p.id === projectId);
    if (projectIndex !== -1) {
      this.projects[projectIndex].pageCount = count;
    }
  }
  
  /**
   * Get project name from URL
   */
  public static getProjectNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      return "Untitled Project";
    }
  }
  
  /**
   * Update project sitemap data
   */
  public static updateProjectSitemap(
    projectId: string, 
    results: ScrapedContent[],
    startUrl: string,
    baseUrl: string,
    baseDomain: string
  ): void {
    const projectIndex = this.projects.findIndex(p => p.id === projectId);
    if (projectIndex !== -1) {
      const sitemapData = SitemapService.generateSitemapForProject(
        results,
        startUrl,
        baseUrl,
        baseDomain
      );
      this.projects[projectIndex].sitemapData = sitemapData;
    }
  }
  
  /**
   * Get a project by its ID
   */
  public static getProject(projectId: string): CrawlProject | null {
    return this.projects.find(p => p.id === projectId) || null;
  }
  
  /**
   * Get all projects
   */
  public static getAllProjects(): CrawlProject[] {
    return [...this.projects];
  }
  
  /**
   * Get sitemap data for a project
   */
  public static getSitemapData(projectId: string) {
    const project = this.projects.find(p => p.id === projectId);
    return project?.sitemapData;
  }
}
