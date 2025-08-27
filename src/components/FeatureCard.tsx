import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient?: string;
  buttonText?: string;
  onAction?: () => void;
}

const FeatureCard = ({ 
  title, 
  description, 
  icon: Icon, 
  gradient = "bg-gradient-subtle",
  buttonText = "시작하기",
  onAction 
}: FeatureCardProps) => {
  return (
    <Card className={`group hover:shadow-education transition-all duration-300 border-0 ${gradient}`}>
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl font-korean">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button 
          onClick={onAction}
          className="w-full bg-gradient-primary hover:opacity-90 shadow-soft font-korean"
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;