import React from 'react';
import { Table, ProgressBar } from 'patternfly-react';
import ReactMarkdown from 'react-markdown';
import ScorecardData from '../../components/ScorecardData';

const headerFormat = value => <Table.Heading>{value}</Table.Heading>;
const cellFormat = value => <Table.Cell>{value}</Table.Cell>;
const noWrapFormat = value => <span style={{ whiteSpace: 'nowrap' }}>{value}</span>;
const mdFormat = value => <ReactMarkdown>{value}</ReactMarkdown>;

// TODO: replace this with link to specific AC
const acLinkFormat = value => (
  <a href={window.ACCEPTANCE_CRITERIA} target="_blank" rel="noopener noreferrer">
    {value}
  </a>
);

// value is red, green or yellow. CSS classes are defined in App.scss
const statusFormat = value => (
  <div>
    <span className={`badge ac-status-${value}`}>{value}</span>
  </div>
);

function sortScorecardItems(a, b) {
  return a.id.localeCompare(b.id);
}

function score(scorecardData) {
  const countStatus = { red: 0, green: 0, yellow: 0 };
  scorecardData.forEach(item => {
    countStatus[item.status] += 1;
  });
  return Math.round((100 * (countStatus.green + 0.5 * countStatus.yellow)) / scorecardData.length);
}

function ScoreTable({ data }) {
  return (
    <table style={{ width: '40%' }}>
      {data.map(m => (
        <tr>
          <td style={{ width: '30%' }}>{m[0]}</td>
          <td>
            <ProgressBarScore now={m[1]} />
          </td>
        </tr>
      ))}
    </table>
  );
}

function ScorecardSection({ category, data, categoryScore }) {
  return (
    <div>
      <h3>
        {category} - {categoryScore}%
      </h3>

      <Table.PfProvider
        striped
        bordered
        columns={[
          {
            header: {
              label: 'ID',
              formatters: [headerFormat]
            },
            cell: { formatters: [noWrapFormat, acLinkFormat, cellFormat] },
            property: 'id'
          },
          {
            header: { label: 'Summary', formatters: [headerFormat] },
            cell: { formatters: [cellFormat] },
            property: 'summary'
          },
          {
            header: { label: 'Status', formatters: [headerFormat] },
            cell: { formatters: [statusFormat, cellFormat] },
            property: 'status'
          },
          {
            header: { label: 'Comment', formatters: [headerFormat] },
            cell: { formatters: [mdFormat, cellFormat] },
            property: 'comment'
          }
        ]}
      >
        <Table.Header />
        <Table.Body rows={data} rowKey="id" />
      </Table.PfProvider>
    </div>
  );
}

function ProgressBarScore({ now }) {
  let bsStyle = 'success';

  if (now < 50) {
    bsStyle = 'danger';
  } else if (now < 80) {
    bsStyle = 'warning';
  }

  return (
    <ProgressBar
      active={false}
      bsClass="progress-bar"
      bsStyle={bsStyle}
      isChild={false}
      max={100}
      min={0}
      now={now}
      srOnly={false}
      striped={false}
      label={`${now}%`}
    />
  );
}

function categoryMatcher(categories, e, m) {
  return categories.slice(0, categories.findIndex(el => el === m) + 1).includes(e.category);
}

function Scorecard({ scorecard }) {
  const scorecardData = ScorecardData.map(e => {
    let ac = scorecard.acceptanceCriteria.find(acItem => acItem.name === e.id);
    if (typeof ac === 'undefined') ac = { status: 'red' };
    return { ...e, ...ac };
  }).sort(sortScorecardItems);

  const categories = ['CONTINUITY', 'INCIDENT-MGMT', 'OBSERVABILITY', 'RELEASING', 'RELIABILITY', 'SECURITY'];

  const categoryScores = categories.map(m => [m, score(scorecardData.filter(e => categoryMatcher(categories, e, m)))]);

  const sections = categories.map(category => (
    <ScorecardSection
      key={category}
      category={category}
      categoryScore={categoryScores.find(e => e[0] === category)[1]}
      data={scorecardData.filter(e => e.category === category)}
    />
  ));

  const onboardingProgress = [['SRE Onboarding Progress', score(scorecardData)]];

  return (
    <React.Fragment>
      <ScoreTable data={onboardingProgress} />
      {sections}
    </React.Fragment>
  );
}

export default Scorecard;