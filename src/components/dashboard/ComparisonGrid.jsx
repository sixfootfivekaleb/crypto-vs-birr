import PropTypes from 'prop-types';
import { AssetCard } from './AssetCard';
import { SkeletonCard } from '../common/Skeleton';
import { ASSETS } from '../../utils/constants';

/**
 * Grid of asset comparison cards
 */
export const ComparisonGrid = ({
  results,
  performance,
  isLoading = false,
  className = '',
}) => {
  const assets = [ASSETS.BIRR, ASSETS.BITCOIN, ASSETS.ETHEREUM, ASSETS.USDT, ASSETS.USD];

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 ${className}`}>
        {assets.map((asset) => (
          <SkeletonCard key={asset} />
        ))}
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 ${className}`}>
      {assets.map((asset) => {
        const data = results[asset];

        // Always render the card - show 0 values if data is missing
        const currentValue = data?.currentValueETB ?? data?.nominalValue ?? 0;
        const gainLoss = data?.gainLossETB ?? 0;
        const gainLossPercent = data?.gainLossPercent ?? (data?.purchasingPowerLoss ? -data.purchasingPowerLoss : 0);

        return (
          <AssetCard
            key={asset}
            asset={asset}
            currentValue={currentValue}
            gainLoss={gainLoss}
            gainLossPercent={gainLossPercent}
            isBest={performance?.best === asset}
            isWorst={performance?.worst === asset}
          />
        );
      })}
    </div>
  );
};

ComparisonGrid.propTypes = {
  results: PropTypes.object,
  performance: PropTypes.shape({
    best: PropTypes.string,
    worst: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
  className: PropTypes.string,
};

export default ComparisonGrid;
