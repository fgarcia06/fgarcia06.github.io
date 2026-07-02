import { useEffect, useState, type CSSProperties } from 'react'
import Page from '../Page'
import Thumb from '../Thumb'
import { type ListItem, type Section, detailFor, relatedFor } from '../../../data/site'
import { useRouter } from '../../../lib/router'
import { useTilt } from '../../../lib/tilt'
import {
  MicroLabel,
  AspectBracket,
  MicroBadge,
  MicroFrame,
  microCode,
} from '../Micro'

/* ------------------------------------------------------------------ */
/* detail pages                                                        */
/* ------------------------------------------------------------------ */

function RelatedEntry({ item, onOpen }: { item: ListItem; onOpen: () => void }) {
  const tilt = useTilt<HTMLDivElement>()
  return (
    <div
      className="tilt list-item"
      ref={tilt}
      style={{ '--accent': item.project.accent } as CSSProperties}
      onClick={onOpen}
    >
      <Thumb project={item.project} className="thumb-img" />
      <div className="card-micro" aria-hidden>
        <div className="card-micro-left">
          <MicroLabel>ASSET_ID {microCode(item.slug)}</MicroLabel>
        </div>
        <div className="card-micro-right">
          <MicroBadge>{item.project.category}</MicroBadge>
        </div>
      </div>
      <div className="titles">
        <div className="subtitle">{item.subtitle}</div>
        <div className="title">{item.title}</div>
      </div>
    </div>
  )
}

export function DetailPage({ section }: { section: Section }) {
  const { visibleState, dataState, go } = useRouter()
  const prefix = `${section.id}/`
  const [slug, setSlug] = useState<string | null>(null)

  // swap content only when the router's dataState reaches this section,
  // so the outgoing page keeps its old content while sliding away
  useEffect(() => {
    if (dataState.startsWith(prefix)) setSlug(dataState.slice(prefix.length))
  }, [dataState, prefix])

  if (section.list.length === 0) return null
  const detail = slug ? detailFor(section, slug) : undefined
  const active = visibleState.startsWith(prefix)

  const related = detail ? relatedFor(section, detail.item) : []

  return (
    <Page id={`${section.id}-detail`} active={active} dataKey={slug ?? ''}>
      {detail && (
        <>
          <div className="page-title" data-aos="zoom-in">
            {detail.item.title}
          </div>
          <div className="page-subtitle" data-aos="zoom-in">
            {detail.item.project.label}
          </div>
          <div className="feature" data-aos="fade-in">
            <div className="feature-content">
              {/* TODO(content): reference shows a project video/gallery here;
                  no captures exist in my sources — generated visual instead */}
              <MicroFrame
                className="feature-frame"
                caption={`ASSET_ID ${microCode(detail.item.slug)} · ${detail.item.project.category}`}
              >
                <Thumb project={detail.item.project} className="feature-thumb sixteen-nine" />
                <AspectBracket className="feature-aspect" ratio="16:9" />
              </MicroFrame>
            </div>
          </div>

          <div className="client" data-aos="fade-in">
            <b>Context: </b>
            {detail.item.project.context}
          </div>
          <div className="role" data-aos="fade-in">
            <b>Stack: </b>
            {detail.item.project.label}
          </div>

          <div className="content-title section-title" data-aos="fade-in">
            [ brief ]
          </div>
          <div className="content" data-aos="fade-in">
            <p className="content-summary">{detail.item.project.summary}</p>
            <ul>
              {detail.item.project.points.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
            <div className="content-quote">{detail.item.project.takeaway}</div>
          </div>

          {related.length > 0 && (
            <>
              <div className="related-title section-title" data-aos="fade-in">
                [ related {section.title} ]
              </div>
              <div className="related-list" data-aos="fade-in">
                {related.map((r) => (
                  <RelatedEntry key={r.slug} item={r} onOpen={() => go(`${prefix}${r.slug}`)} />
                ))}
              </div>
            </>
          )}

          <div className="bottom-nav">
            <div className="bottom-back" onClick={() => go(`${prefix}${detail.prev.slug}`)}>
              &#8672; prev
            </div>
            <div className="bottom-up" onClick={() => go(section.id)}>
              back to {section.title}
            </div>
            <div className="bottom-next" onClick={() => go(`${prefix}${detail.next.slug}`)}>
              next &#8674;
            </div>
          </div>
        </>
      )}
    </Page>
  )
}
