// Re-export content components from @hanzo/ui
// This allows consumers to import MDX components from @hanzo/mdx directly

// General-purpose content blocks
export {
  Card,
  Cards,
  Tab,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Step,
  Steps,
  Callout,
  CalloutContainer,
  CalloutTitle,
  CalloutDescription,
  Accordion,
  Accordions,
} from '@hanzo/ui/content'

export type {
  CardProps,
  TabProps,
  TabsProps,
  CalloutType,
  CalloutContainerProps,
} from '@hanzo/ui/content'

// Docs-specific components
export { TypeTable } from '@hanzo/ui/docs/components'
export type { TypeNode, ParameterNode } from '@hanzo/ui/docs/components'

// Re-export default MDX components for convenience
export { default as defaultMdxComponents } from '@hanzo/ui/docs/mdx'
