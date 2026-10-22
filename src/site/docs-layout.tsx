import * as React from "react"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"
import { Link, NavLink, Navigate, Outlet, useParams } from "react-router-dom"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { agents, components, docs, ordered, pages, urlOf, type PageEntry } from "@/site/pages"

/* ---- The column of names down the left ---------------------------------- */

function SidebarGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pt-6 first:pt-0">
      <div className="px-2 pb-1 text-xs font-medium text-muted-foreground">{label}</div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

function SidebarLink({ to, end, children }: { to: string; end?: boolean; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "relative flex h-[30px] w-fit items-center rounded-md px-2 text-[0.8rem] font-medium text-foreground/90 outline-none hover:bg-accent focus-visible:bg-accent",
          isActive && "glass-chosen text-foreground"
        )
      }
    >
      {children}
    </NavLink>
  )
}

export function DocsLayout() {
  return (
    <div className="container-wrapper flex flex-1 flex-col px-2">
      <div className="min-h-min flex-1 items-start px-0 [--sidebar-width:calc(var(--spacing)*72)] [--top-spacing:0] lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] lg:[--top-spacing:calc(var(--spacing)*4)]">
        <aside className="sticky top-[calc(var(--header-height)+0.6rem)] z-30 hidden h-[calc(100svh-10rem)] overscroll-none lg:flex">
          <div className="no-scrollbar w-(--sidebar-width) overflow-y-auto px-2 pt-(--top-spacing) pb-12 [mask-image:linear-gradient(to_bottom,black_calc(100%-3rem),transparent)]">
            <SidebarGroup label="Sections">
              {docs.map((page) => (
                <SidebarLink key={page.slug} to={urlOf(page)} end>
                  {page.title}
                </SidebarLink>
              ))}
              <SidebarLink to="/docs/components" end>
                Components
              </SidebarLink>
            </SidebarGroup>
            <SidebarGroup label="Components">
              {components.map((page) => (
                <SidebarLink key={page.slug} to={urlOf(page)}>
                  {page.title}
                </SidebarLink>
              ))}
            </SidebarGroup>
            <SidebarGroup label="Agents">
              {agents.map((page) => (
                <SidebarLink key={page.slug} to={urlOf(page)}>
                  {page.title}
                </SidebarLink>
              ))}
            </SidebarGroup>
          </div>
        </aside>
        <div className="h-full w-full">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

function Neighbours({ url, labelled }: { url: string; labelled?: boolean }) {
  const at = ordered.findIndex((entry) => entry.url === url)
  const [previous, next] = [ordered[at - 1], ordered[at + 1]]
  const cls = labelled ? buttonVariants({ variant: "secondary", size: "sm" }) : cn(buttonVariants({ variant: "secondary", size: "icon" }), "size-7")
  return (
    <>
      {previous && (
        <Link to={previous.url} data-slot="button" data-variant="secondary" className={cls}>
          <ArrowLeftIcon /> {labelled ? previous.title : <span className="sr-only">Previous</span>}
        </Link>
      )}
      {next && (
        <Link to={next.url} data-slot="button" data-variant="secondary" className={cn(cls, labelled && "ml-auto")}>
          {labelled ? next.title : <span className="sr-only">Next</span>} <ArrowRightIcon />
        </Link>
      )}
    </>
  )
}

export function DocShell({ title, description, url, toc, children }: { title: string; description: string; url: string; toc?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div data-slot="docs" className="flex scroll-mt-24 items-stretch pb-8 text-[1.05rem] sm:text-[15px] xl:w-full">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-(--top-spacing) shrink-0" />
        <div className="mx-auto flex w-full max-w-160 min-w-0 flex-1 flex-col gap-6 px-4 py-6 text-foreground md:px-0 lg:py-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between md:items-start">
              <h1 className="scroll-m-24 text-3xl font-semibold tracking-tight">{title}</h1>
              <div className="ml-auto flex gap-2">
                <Neighbours url={url} />
              </div>
            </div>
            {description && <p className="text-[1.05rem] text-muted-foreground sm:text-base sm:text-balance md:max-w-[80%]">{description}</p>}
          </div>
          <div className="w-full flex-1 pb-16 sm:pb-0">{children}</div>
          <div className="hidden h-16 w-full items-center gap-2 px-4 sm:flex sm:px-0">
            <Neighbours url={url} labelled />
          </div>
        </div>
      </div>
      <div className="sticky top-[calc(var(--header-height)+1px)] z-30 ml-auto hidden h-[90svh] w-(--sidebar-width) flex-col gap-4 overflow-hidden overscroll-none pb-8 xl:flex">
        <div className="h-(--top-spacing) shrink-0" />
        <div className="no-scrollbar flex flex-col gap-8 overflow-y-auto px-8">{toc}</div>
      </div>
    </div>
  )
}

export type DocSection = "docs" | "components"

export function useDocEntry(section: DocSection) {
  const { slug = "introduction" } = useParams()
  return pages.find((entry) => entry.slug === slug && (section === "docs" ? entry.section === "docs" : entry.section !== "docs"))
}

export function DocLoading({ section, failed = false }: { section: DocSection; failed?: boolean }) {
  const page = useDocEntry(section)
  if (!page) return <Navigate to="/docs/components" replace />
  return (
    <DocShell title={page.title} description={page.description} url={urlOf(page)}>
      <div className="min-h-[50svh] py-6 text-muted-foreground" role={failed ? "alert" : "status"}>
        {failed ? (
          <>
            <p>Unable to load this document. Please reload to try again.</p>
            <button type="button" className="mt-4 underline underline-offset-4" onClick={() => window.location.reload()}>Reload page</button>
          </>
        ) : "Loading documentation…"}
      </div>
    </DocShell>
  )
}

export class DocErrorBoundary extends React.Component<{ section: DocSection; resetKey: string; children: React.ReactNode }, { failed: boolean; resetKey: string }> {
  state = { failed: false, resetKey: this.props.resetKey }
  static getDerivedStateFromProps(props: { resetKey: string }, state: { resetKey: string }) {
    return props.resetKey !== state.resetKey ? { failed: false, resetKey: props.resetKey } : null
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? <DocLoading section={this.props.section} failed /> : this.props.children
  }
}

function ComponentGrid({ list }: { list: PageEntry[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-x-8 lg:gap-x-16 lg:gap-y-6 xl:gap-x-20">
      {list.map((page) => (
        <Link key={page.slug} to={urlOf(page)} className="inline-flex items-center gap-2 text-lg font-medium underline-offset-4 hover:underline md:text-base">
          {page.title}
        </Link>
      ))}
    </div>
  )
}

export function ComponentsIndex() {
  return (
    <DocShell
      title="Components"
      description="Here you can find all the components available in the library, each one in Solid Glass."
      url="/docs/components"
    >
      <h2 id="all-components" className="mt-10 mb-6 scroll-m-28 text-xl font-medium tracking-tight first:mt-0">
        All Components
      </h2>
      <ComponentGrid list={components} />
      <h2 id="agents" className="mt-12 mb-2 scroll-m-28 text-xl font-medium tracking-tight">
        Agents
      </h2>
      <p className="mb-6 text-muted-foreground">A few more, for interfaces where an agent works while someone watches.</p>
      <ComponentGrid list={agents} />
    </DocShell>
  )
}
