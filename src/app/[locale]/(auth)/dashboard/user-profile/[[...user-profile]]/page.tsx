'use client';

import { DashboardMainContent } from '../../components/DashboardMainContent';
import { DashboardSidebar } from '../../components/DashboardSidebar';
import { useDashboardState } from '../../hooks/useDashboardState';

const DashboardIndexPage = () => {
  const {
    product,
    objective,
    segment,
    products,
    objectives,
    segments,
    responses,
    loading,
    error,
    handleSetProduct,
    handleSetObjective,
    handleSetSegment,
    runLLMPrompts,
  } = useDashboardState();

  const handleSubmit = () => {
    runLLMPrompts();
  };

  const handleSaveReport = async (_reportData: any) => {
    // This would integrate with the database save functionality
    // You can implement the same save logic here as in the main dashboard
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar
        products={products}
        objectives={objectives}
        segments={segments}
        product={product}
        objective={objective}
        segment={segment}
        setProduct={handleSetProduct}
        setObjective={handleSetObjective}
        setSegment={handleSetSegment}
        onSubmit={handleSubmit}
        loading={loading}
      />

      <DashboardMainContent
        responses={responses}
        loading={loading}
        selectedSegment={segment}
        error={error}
        onSaveReport={handleSaveReport}
      />
    </div>
  );
};

export default DashboardIndexPage;
