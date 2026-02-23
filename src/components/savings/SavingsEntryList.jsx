import PropTypes from 'prop-types';
import { AnimatePresence } from 'framer-motion';
import { useSavingsStore } from '../../store/savingsStore';
import { SavingsEntry } from './SavingsEntry';

/**
 * List of savings entries with animations
 */
export const SavingsEntryList = ({ className = '' }) => {
  const entries = useSavingsStore((state) => state.entries);
  const canDelete = entries.length > 1;

  return (
    <div className={`space-y-3 ${className}`}>
      <AnimatePresence mode="popLayout">
        {entries.map((entry, index) => (
          <SavingsEntry
            key={entry.id}
            entry={entry}
            index={index}
            canDelete={canDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

SavingsEntryList.propTypes = {
  className: PropTypes.string,
};

export default SavingsEntryList;
