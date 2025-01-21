import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutDialog({ isOpen, onClose }: AboutDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2B4C7E]">
            About SwapDecks
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-gray-600 dark:text-gray-300">
          <div>
            <h3 className="text-lg font-semibold text-[#2B4C7E] mb-2">
              Our Mission
            </h3>
            <p>
              SwapDecks is a revolutionary platform designed to transform the
              way people learn and share knowledge through flashcards. We
              believe in the power of community-driven learning and aim to
              create a marketplace where knowledge can be easily shared and
              acquired.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#2B4C7E] mb-2">
              How It Works
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="font-medium">Create & Share:</span> Build your
                own flashcard decks and share them with the community
              </li>
              <li>
                <span className="font-medium">Buy & Learn:</span> Access
                high-quality flashcard decks created by experts and fellow
                learners
              </li>
              <li>
                <span className="font-medium">Earn:</span> Monetize your
                knowledge by selling your flashcard decks
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#2B4C7E] mb-2">
              Our Features
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Diverse categories covering various subjects and skills</li>
              <li>Secure payment system for buying and selling decks</li>
              <li>User-friendly interface for creating and studying</li>
              <li>Community-driven content with quality assurance</li>
              <li>Personalized learning experience</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#2B4C7E] mb-2">
              Join Our Community
            </h3>
            <p>
              Whether you're a student, teacher, professional, or lifelong
              learner, SwapDecks provides the tools and platform you need to
              enhance your learning journey. Join our growing community of
              knowledge seekers and sharers today!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
