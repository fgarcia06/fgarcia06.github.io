import { skillGroups } from '../../data/skills'
import { Stagger, Item } from '../stage/Stagger'
import { Panel } from '../ui/Panel'
import { Tag } from '../ui/Tag'
import { ViewHeader } from '../stage/ViewHeader'
import { GhostLabel } from '../stage/GhostLabel'

export function SkillsView({ accent }: { accent: string }) {
  return (
    <div className="relative">
      <GhostLabel text="Stack" className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

      <Stagger className="flex flex-col items-center text-center">
        <ViewHeader
          no={4}
          accent={accent}
          eyebrow="Toolkit"
          title="What I work with"
          intro="Languages, frameworks, and hardware across robotics, full-stack, and applied ML."
        />

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((g) => (
            <Item key={g.title}>
              <Panel className="h-full">
                <h3 className="font-serif text-xl font-semibold" style={{ color: accent }}>
                  {g.title}
                </h3>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {g.tags.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              </Panel>
            </Item>
          ))}
        </div>
      </Stagger>
    </div>
  )
}
