import React, { useState } from 'react'
import { PullRequest, Repository } from '@plusone/github-schema'

import { CheckConclusionResult } from './check-conclusion-result'

interface PrDetailsProps {
  pullRequest: PullRequest[]
}

export const PrDetails: React.FC<PrDetailsProps> = ({ pullRequest }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <React.Fragment>
      <button
        disabled={pullRequest.length === 0}
        onClick={() => setIsOpen((prevState) => !prevState)}
      >
        {isOpen ? 'Hide Details' : 'Show Details'}
      </button>
      {isOpen && pullRequest.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {pullRequest.map((pr) => {
              const prCheckState = pr.commits.nodes
                .flatMap((node) => node.commit.checkSuites.nodes)
                .flatMap((node) => node.conclusion)
                .pop()

              return (
                <tr key={pr.number}>
                  <td>
                    <a href={pr.url} target={'_blank'} rel={'noreferrer'}>
                      {pr.title}
                    </a>
                  </td>
                  <td>{CheckConclusionResult[prCheckState]}</td>
                  <td>{pr.author.login}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : null}
    </React.Fragment>
  )
}
