import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Template, TemplateFeature } from "../../types/template";
import { Eye, Download, ExternalLink } from "lucide-react";

// Helper function to get proper feature labels
const getFeatureLabel = (feature: TemplateFeature): string => {
  const labels: Record<TemplateFeature, string> = {
    [TemplateFeature.ONLINE_BOOKING]: 'Online Booking',
    [TemplateFeature.PATIENT_PORTAL]: 'Patient Portal',
    [TemplateFeature.ECOMMERCE]: 'E-commerce',
    [TemplateFeature.BLOG]: 'Blog',
    [TemplateFeature.CONTACT_FORMS]: 'Contact Forms',
    [TemplateFeature.TELEHEALTH]: 'Telehealth',
    [TemplateFeature.APPOINTMENT_MANAGEMENT]: 'Appointments',
    [TemplateFeature.PAYMENT_INTEGRATION]: 'Payments'
  };
  return labels[feature] || feature.replace('-', ' ');
};

interface TemplateCardProps {
  // Define any props if needed in the future
  template: Template;
  variant?: "default" | "featured" | "compact";
  showActions?: boolean;
  onPreview?: (template: Template) => void;
  onDownload?: (template: Template) => void;
  className?: string;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  variant,
  showActions,
  onPreview,
  onDownload,
  className,
}) => {
  return (
    <div
      className={`group bg-white rounded-lg shadow-md hover:shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${className}`}
    >
      {/* Image Section */}
      <div className="relative aspect-video bg-gray-100">
        {/* Template Thumbnail Image */}
        {template.images.thumbnail ? (
          <img
            src={template.images.thumbnail}
            alt={`${template.title} template preview`}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <ExternalLink className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm">Preview Coming Soon</span>
            </div>
          </div>
        )}

        {/* Status Badge - Featured/New/etc */}
        {template.status === "featured" && (
          <div className="absolute top-3 left-3">
            <Badge
              variant="default"
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium"
            >
              Featured
            </Badge>
          </div>
        )}

        {/* Pricing Badge */}
        <div className="absolute top-3 right-3">
          <Badge
            variant="secondary"
            className="bg-white/90 backdrop-blur-sm text-brand-600 font-medium"
          >
            {template.pricing.type === "free"
              ? "Free"
              : template.pricing.type === "premium"
              ? `$${template.pricing.price}`
              : "Custom"}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Category Badge */}
        <div className="mb-3">
          <Badge
            variant="outline"
            className="text-brand-600 border-brand-200 bg-brand-50"
          >
            {template.category.charAt(0).toUpperCase() +
              template.category.slice(1).replace("-", " ")}
          </Badge>
        </div>
        {/* Title */}
        <h3 className="font-heading font-bold text-xl text-gray-900 mb-2 group-hover:text-brand-600 transition-colors duration-200">
          {template.title}
        </h3>
        {/* Description */}
        <p className="font-body text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
          {template.description}
        </p>
        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {template.features.slice(0, 3).map((feature) => (
            <Badge 
            key={feature} 
            variant="secondary" 
            className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              {getFeatureLabel(feature)}
            </Badge>
          ))}
          {template.features.length > 3 && (
            <Badge
              variant='secondary'
              className="text-xs bg-gray-100 text-gray-600">
              +{template.features.length - 3} more
            </Badge>
          )}
        </div>

        {/* Technologies */}
        <div className="text-xs text-gray-500 font-body">
          Built with: {template.technologies.slice(0, 3).join(', ')}
          {template.technologies.length > 3 && '...'}
        </div>
        {/* Actions Footer */}
        {showActions !== false && (
          <div className="px-6 pb-6 pt-0">
            <div className="flex flex-col sm:flex-row gap-3">
            {/* Primary Action - View Details */}
            <Link
              to={`/templates/${template.id}`}
              className="flex-1"
            >
              <Button
                variant='default'
                className="w-full bg-brand-600 hover:bg-brand-700 text-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </Link>
            {/* Secondary Action - Download/Preview */}
            <div className="flex gap-2 sm:flex-shrink-0">
              {/* Preview Button */}
              {template.demoUrl && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => onPreview?.(template)}
                  className="border-brand-200 text-brand-600 hover:bg-brand-50"
                  >
                  <ExternalLink className="w-4 h-4" />
                  <span className="sr-only">Preview</span>
                </Button>
              )}
              {/* Download Button */}
              {template.pricing.type !== 'custom' && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => onDownload?.(template)}
                  className="border-brand-200 text-brand-600 hover:bg-brand-50"
                >
                  <Download className="w-4 h-4" />
                  <span className="sr-only">Download</span>
                </Button>
              )}
            </div>
          </div>
          {/* Template Complexity Indicator */}
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span className=" flex items-center">
              Complexity:
              <span className={`ml-1 font-medium ${
                template.meta.complexity === 'simple' ? 'text-green-600' :
                template.meta.complexity === 'moderate' ? 'text-orange-600' :
                'text-red-600'
              }`}>
                {template.meta.complexity.charAt(0).toUpperCase() + template.meta.complexity.slice(1)}
              </span>
            </span>
            <span>Updated: {new Date(template.meta.lastUpdated).toLocaleDateString()}</span>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateCard;
