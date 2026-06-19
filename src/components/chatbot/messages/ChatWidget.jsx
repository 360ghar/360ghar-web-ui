import React from 'react';
import { useTranslation } from 'react-i18next';
import PropertyResultsWidget from '../widgets/PropertyResultsWidget';
import PropertyDetailWidget from '../widgets/PropertyDetailWidget';
import VisitListWidget from '../widgets/VisitListWidget';
import DashboardWidget from '../widgets/DashboardWidget';
import LeaseWidget from '../widgets/LeaseWidget';
import MaintenanceWidget from '../widgets/MaintenanceWidget';
import GenericWidget from '../widgets/GenericWidget';

// Widget name → component mapping
const WIDGET_MAP = {
  PropertySearchWidget: PropertyResultsWidget,
  PropertyDetailsWidget: PropertyDetailWidget,
  VisitListWidget: VisitListWidget,
  VisitSchedulerWidget: VisitListWidget,      // reuse for now
  OwnerDashboardWidget: DashboardWidget,
  LeaseDetailsWidget: LeaseWidget,
  LeaseManagementWidget: LeaseWidget,
  MaintenanceWidget: MaintenanceWidget,
  RentCollectionWidget: GenericWidget,
  TenantRentWidget: GenericWidget,
  PropertySwipeWidget: GenericWidget,
};

// Simple error boundary class component
class WidgetErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="chatbot-widget chatbot-widget--error">
          <p>{this.props.errorText}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ChatWidget({ message }) {
  const { t } = useTranslation('common');
  const { widgetName, structuredContent } = message.widget || {};

  if (!widgetName) return null;

  const WidgetComponent = WIDGET_MAP[widgetName] || GenericWidget;

  return (
    <div className="chatbot-widget-wrapper">
      <WidgetErrorBoundary errorText={t('chatbot.widgetError')}>
        <WidgetComponent
          data={structuredContent}
          widgetName={widgetName}
        />
      </WidgetErrorBoundary>
    </div>
  );
}
