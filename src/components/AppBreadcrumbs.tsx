import { Link } from '@tanstack/react-router'
import { Fragment } from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb'
import { cn } from '~/lib/utils'

export type BreadcrumbCrumb = {
  label: string
  /** Omit on the current (last) page. */
  to?: string
  params?: Record<string, string>
}

type AppBreadcrumbsProps = {
  items: BreadcrumbCrumb[]
  className?: string
}

export function AppBreadcrumbs({ items, className }: AppBreadcrumbsProps) {
  const trail: BreadcrumbCrumb[] = [{ label: 'Shop', to: '/' }, ...items]

  return (
    <Breadcrumb className={cn('mb-6', className)}>
      <BreadcrumbList>
        {trail.map((crumb, index) => {
          const isLast = index === trail.length - 1
          const key = `${crumb.label}-${index}`

          return (
            <Fragment key={key}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : crumb.to ? (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.to} params={crumb.params}>
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <span className="text-muted-foreground">{crumb.label}</span>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
