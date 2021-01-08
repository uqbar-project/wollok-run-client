export default undefined
// import React, { useContext, memo } from 'react'
// import { shortId } from './Utils'
// import { EvaluationContext, LayoutContext } from './BytecodeDebuggerContexts'
// import Context from './Context'
// import Section from './Section'
// import { Context as ContextType } from 'wollok-ts/dist/interpreter'
// import SearchBar from './SearchBar'
// import $ from './ContextSearchList.module.scss'


// const { keys } = Object


// export type ContextSearchListProps = { }

// const ContextSearchList = ({ }: ContextSearchListProps) => {
//   const { evaluation } = useContext(EvaluationContext)
//   const { contextSearch, setContextSearch } = useContext(LayoutContext)

//   const elements = evaluation.listContexts().map(id => evaluation.context(id))
//   const searchTerms = (context: ContextType) => [
//     shortId(context.id),
//     ...keys(context.locals).flatMap(name => [name, shortId(context.locals[name])]),
//   ]

//   const content = elements
//     .filter(element => searchTerms(element).some(term => term.includes(contextSearch)))
//     .map(context => (
//       <Context
//         context={context}
//         nameFilter={name => shortId(context.id).includes(contextSearch) || name.includes(contextSearch) || shortId(context.locals[name]).includes(contextSearch)}
//         key={context.id}
//       />
//     ))

//   return (
//     <Section
//       title={`Contexts (${content.length}/${elements.length})`}
//       titleDecoration={<SearchBar search={contextSearch} setSearch={setContextSearch}/>}
//       contentClassName={$.content}
//     >
//       {content}
//     </Section>
//   )
// }

// export default memo(ContextSearchList)